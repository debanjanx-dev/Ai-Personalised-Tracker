import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { subject, examType, classLevel } = await request.json();
    
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }
    
    // Create a prompt for Gemini to generate chapter flow with study insights
    const prompt = `
      Act as an educational expert and create a detailed study flow for a ${classLevel || 'high school'} student 
      studying the subject "${subject}" ${examType ? `for ${examType} exam` : ''}.
      
      Generate a structured learning path with chapters, their dependencies, and study insights. 
      The response should be in the following JSON format:
      {
        "nodes": [
          {
            "id": "unique_id",
            "type": "topic",
            "label": "Chapter name",
            "description": "Brief description of what this chapter covers",
            "estimatedHours": number,
            "difficulty": "easy|medium|hard",
            "studyInsights": {
              "bestPractices": ["Practice tip 1", "Practice tip 2"],
              "commonMistakes": ["Common mistake 1", "Common mistake 2"],
              "studyTechniques": ["Technique 1", "Technique 2"],
              "resourceRecommendations": ["Resource 1", "Resource 2"]
            }
          }
        ],
        "edges": [
          {
            "id": "unique_id",
            "source": "source_node_id",
            "target": "target_node_id"
          }
        ],
        "overallStudyStrategy": {
          "recommendedApproach": "Brief description of overall approach",
          "timeManagement": "Tips for managing study time",
          "examPreparation": "Specific advice for exam preparation",
          "practiceRecommendations": "Recommendations for practice"
        }
      }

      Important guidelines:
      1. Return ONLY the JSON without any markdown formatting
      2. Generate exactly 5-7 chapters (nodes) that are essential for the subject
      3. Ensure chapters are organized in a logical learning sequence
      4. Each chapter should have a descriptive label and brief description
      5. Estimate reasonable study hours for each chapter based on complexity
      6. Assign a difficulty level to each chapter
      7. Create edges that connect chapters in the recommended study order
      8. Some chapters may have multiple prerequisites (multiple incoming edges)
      9. Use the standard curriculum for ${classLevel || 'high school'} ${subject}
      10. Include detailed study insights for each chapter
      11. Provide an overall study strategy section with general advice
    `;
    
    // Generate content using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      // Extract the JSON from the text (it might be wrapped in markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      
      const flowData = JSON.parse(jsonMatch[0]);
      
      // Add positions to nodes for React Flow visualization
      flowData.nodes = flowData.nodes.map((node: any, index: number) => ({
        ...node,
        position: { 
          x: 150 + (index % 3) * 300, 
          y: 100 + Math.floor(index / 3) * 200 
        }
      }));
      
      return NextResponse.json({ flowData });
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw response:', text);
      
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating chapter flow:', error);
    return NextResponse.json(
      { error: 'Failed to generate chapter flow' },
      { status: 500 }
    );
  }
}