import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/db';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { quizId, examId, subject, chapter, answers } = await request.json();
    
    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Answers array is required' },
        { status: 400 }
      );
    }

    // Calculate score and identify weak areas
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalQuestions = answers.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Get incorrectly answered questions
    const incorrectAnswers = answers.filter(a => !a.isCorrect);
    const weakConcepts = incorrectAnswers.map(a => a.conceptTested);
    
    // Get the Gemini model for personalized recommendations
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create a prompt for personalized study recommendations
    const prompt = `
    I'm analyzing a student's quiz results on ${subject}, chapter "${chapter}".
    
    The student scored ${score}% (${correctAnswers} out of ${totalQuestions} correct).
    
    The student struggled with these concepts:
    ${weakConcepts.map((concept, i) => `${i+1}. ${concept}`).join('\n')}
    
    Based on this performance, provide:
    
    1. A personalized study plan focusing on weak areas
    2. Specific topics to review in depth
    3. Recommended study techniques for these concepts
    4. Suggested practice exercises
    
    Format your response as a JSON object with these keys:
    {
      "overallAssessment": "Brief assessment of performance",
      "weakAreas": ["List of weak areas"],
      "studyPlan": "Detailed study plan",
      "studyTechniques": ["List of recommended techniques"],
      "practiceExercises": ["List of suggested exercises"]
    }
    `;

    // Generate personalized recommendations
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract the JSON from the response
    let recommendations;
    try {
      // Find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract JSON from response");
      }
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      return NextResponse.json(
        { error: 'Failed to generate recommendations' },
        { status: 500 }
      );
    }

    // Store quiz results in the database
    if (quizId) {
      try {
        // Save quiz attempt
        const attemptResult = await db.query(
          `INSERT INTO quiz_attempts (quiz_id, user_id, score, completed_at)
           VALUES ($1, $2, $3, NOW())
           RETURNING id`,
          [quizId, userId, score]
        );
        
        const attemptId = attemptResult.rows[0].id;
        
        // Save individual answers
        for (const answer of answers) {
          await db.query(
            `INSERT INTO quiz_answers (attempt_id, question_id, user_answer, is_correct)
             VALUES ($1, $2, $3, $4)`,
            [attemptId, answer.questionId, answer.userAnswer, answer.isCorrect]
          );
        }
        
        // Save recommendations
        await db.query(
          `INSERT INTO study_recommendations (user_id, exam_id, subject, chapter, weak_areas, study_plan, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            userId, 
            examId, 
            subject, 
            chapter, 
            JSON.stringify(recommendations.weakAreas),
            JSON.stringify(recommendations)
          ]
        );
      } catch (dbError) {
        console.error('Error saving quiz results to database:', dbError);
      }
    }

    return NextResponse.json({
      score,
      correctAnswers,
      totalQuestions,
      recommendations
    });
    
  } catch (error) {
    console.error('Error processing quiz submission:', error);
    return NextResponse.json(
      { error: 'Failed to process quiz submission' },
      { status: 500 }
    );
  }
}