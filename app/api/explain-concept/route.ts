import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

    const { question, interests } = await request.json();
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create a prompt that asks for multiple explanation styles
    const prompt = `
    I need you to explain the following concept in multiple ways to help a student understand it better:
    
    CONCEPT: ${question}
    
    ${interests ? `The student is interested in: ${interests}` : ''}
    
    Please provide four different explanations:
    
    1. CONCEPTUAL: A clear, straightforward explanation of the concept focusing on the fundamental principles.
    
    2. VISUAL: Describe how this concept could be visualized with a diagram or image. Include a detailed description of what the visual representation would look like.
    
    3. ANALOGICAL: Create analogies that make this concept relatable${interests ? `, ideally connecting to the student's interests in ${interests}` : ''}.
    
    4. STEP_BY_STEP: Break down the concept into sequential steps or a process that's easy to follow.
    
    Format your response as JSON with these keys: conceptual, visual, analogical, stepByStep.
    `;

    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract the JSON from the response
    // This is a simple extraction - you might need more robust parsing depending on Gemini's output
    let jsonResponse;
    try {
      // Find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonResponse = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if no JSON is found
        jsonResponse = {
          conceptual: "Sorry, I couldn't generate a conceptual explanation at this time.",
          visual: "Sorry, I couldn't generate a visual explanation at this time.",
          analogical: "Sorry, I couldn't generate analogies at this time.",
          stepByStep: "Sorry, I couldn't generate step-by-step instructions at this time."
        };
      }
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      return NextResponse.json(
        { error: 'Failed to parse explanation' },
        { status: 500 }
      );
    }

    // For a real implementation, you would generate or retrieve an actual image URL
    // This is a placeholder - in a production app, you would use Gemini's image generation capabilities
    // or another service to create a visual aid based on the concept
    const visualUrl = null; // Replace with actual image generation in production

    return NextResponse.json({
      ...jsonResponse,
      visualUrl
    });
    
  } catch (error) {
    console.error('Error explaining concept:', error);
    return NextResponse.json(
      { error: 'Failed to explain concept' },
      { status: 500 }
    );
  }
}