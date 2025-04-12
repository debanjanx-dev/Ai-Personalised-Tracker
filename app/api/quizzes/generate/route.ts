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

    const { examId, subject, chapter, difficulty = 'medium', questionCount = 5 } = await request.json();
    
    if (!subject || !chapter) {
      return NextResponse.json(
        { error: 'Subject and chapter are required' },
        { status: 400 }
      );
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create a prompt for quiz generation
    const prompt = `
    Create a quiz for a student studying ${subject}, specifically on the chapter "${chapter}".
    
    Generate ${questionCount} multiple-choice questions with varying difficulty levels.
    The overall difficulty should be: ${difficulty} (easy/medium/hard).
    
    Format your response as a JSON object with the following structure:
    {
      "questions": [
        {
          "id": "1",
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A",
          "explanation": "Detailed explanation of why this is the correct answer",
          "difficulty": "easy/medium/hard",
          "conceptTested": "The specific concept this question tests",
          "recommendedStudyTopic": "What to study if the student gets this wrong"
        }
      ]
    }
    
    Ensure questions test different aspects of the chapter and cover key concepts.
    Provide clear explanations for each correct answer.
    `;

    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract the JSON from the response
    let quizData;
    try {
      // Find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract JSON from response");
      }
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      return NextResponse.json(
        { error: 'Failed to generate quiz' },
        { status: 500 }
      );
    }

    // Store the quiz in the database if examId is provided
    if (examId) {
      try {
        const quizId = await db.query(
          `INSERT INTO quizzes (exam_id, user_id, subject, chapter, difficulty, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           RETURNING id`,
          [examId, userId, subject, chapter, difficulty]
        );
        
        // Store each question
        for (const question of quizData.questions) {
          await db.query(
            `INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation, difficulty, concept_tested, recommended_study)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              quizId.rows[0].id,
              question.question,
              JSON.stringify(question.options),
              question.correctAnswer,
              question.explanation,
              question.difficulty,
              question.conceptTested,
              question.recommendedStudyTopic
            ]
          );
        }
        
        // Add quiz ID to the response
        quizData.quizId = quizId.rows[0].id;
      } catch (dbError) {
        console.error('Error saving quiz to database:', dbError);
        // Continue even if saving fails - we'll still return the quiz to the user
      }
    }

    return NextResponse.json(quizData);
    
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}