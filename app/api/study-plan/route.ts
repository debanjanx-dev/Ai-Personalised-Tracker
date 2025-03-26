import { GoogleGenerativeAI } from '@google/generative-ai';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Helper function to extract JSON from a potentially markdown-formatted response
function extractJsonFromResponse(text: string): string {
  // Check if the response contains markdown JSON code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch && jsonMatch[1]) {
    return jsonMatch[1].trim();
  }
  
  // If no markdown blocks, return the original text
  return text;
}

export async function POST(request: Request) {
  try {
    console.log('Gemini API Key exists:', !!process.env.GEMINI_API_KEY);
    const body = await request.json();
    const { examTitle, subject, date, board, className } = body;

    const prompt = `
      Act as an educational expert and create a detailed study plan for a ${className}th grade ${board} student 
      preparing for ${examTitle} exam in ${subject} scheduled on ${date}. 
      
      The response should be in the following JSON format without any markdown formatting:
      {
        "nodes": [
          {
            "id": "unique_id",
            "type": "topic|subtopic",
            "label": "Topic name",
            "description": "Brief description",
            "estimatedHours": number
          }
        ],
        "edges": [
          {
            "id": "unique_id",
            "source": "source_node_id",
            "target": "target_node_id"
          }
        ]
      }

      Important: Return ONLY the JSON without any markdown formatting, explanation, or code blocks.
      Ensure topics are organized in a logical learning sequence.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    // Extract JSON from the response
    const jsonString = extractJsonFromResponse(response);
    console.log('Extracted JSON:', jsonString.substring(0, 100) + '...');
    
    try {
      const studyPlan = JSON.parse(jsonString);

      // Add positions to nodes
      studyPlan.nodes = studyPlan.nodes.map((node: any, index: number) => ({
        ...node,
        position: { x: index * 200, y: index % 2 === 0 ? 0 : 100 }
      }));

      return NextResponse.json(studyPlan);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      console.error('Raw response:', response);
      return NextResponse.json(
        { message: "Failed to parse AI response as JSON" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating study plan:', error);
    return NextResponse.json(
      { message: "Failed to generate study plan" },
      { status: 500 }
    );
  }
} 