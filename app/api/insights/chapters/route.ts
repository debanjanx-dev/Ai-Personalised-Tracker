import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Helper function to process chapter requests
async function processChapterRequest(subject: string | null, board: string = 'CBSE', grade: string = '12') {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
            { message: "Gemini API key is not configured" },
            { status: 500 }
        );
    }

    if (!subject) {
        return NextResponse.json(
            { message: "Subject parameter is required" },
            { status: 400 }
        );
    }

    try {
        // Create prompt for Gemini
        const prompt = `
    Act as an educational expert for ${board} board, class ${grade}.
    
    Provide a JSON response with chapters and their topics for the subject: ${subject}.
    
    Format:
    [
        {
            "id": 1,
            "title": "Chapter Title",
            "description": "Brief description",
            "difficulty": "Easy/Medium/Hard",
            "estimatedStudyHours": 5,
            "topics": ["Topic 1", "Topic 2", "Topic 3"]
        }
    ]
    
    Provide only the JSON without additional text.
`;


        // Generate content with Gemini
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();

        // Parse the JSON response
        try {
            // Extract JSON from the response (in case Gemini adds extra text)
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error("Could not extract JSON from response");
            }
            
            const chapters = JSON.parse(jsonMatch[0]);
            
            // Return successful response
            return NextResponse.json({ chapters });
        } catch (parseError) {
            console.error("Error parsing Gemini response:", parseError);
            return NextResponse.json(
                { 
                    message: "Failed to parse AI response",
                    rawResponse: responseText
                },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error("Error in API handler:", error);
        
        // Handle specific Gemini API errors
        if (error.message?.includes('API key')) {
            return NextResponse.json(
                { message: "Invalid Gemini API key. Please check your configuration." },
                { status: 401 }
            );
        }

        if (error.message?.includes('quota')) {
            return NextResponse.json(
                { message: "Gemini API quota exceeded. Please check your usage and billing settings." },
                { status: 402 }
            );
        }

        return NextResponse.json(
            { 
                message: "Internal Server Error",
                error: error.message 
            },
            { status: 500 }
        );
    }
}

// GET method handler
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const board = searchParams.get('board') || 'CBSE';
    const grade = searchParams.get('grade') || '12';
    
    return processChapterRequest(subject, board, grade);
}

// POST method handler
export async function POST(request: Request) {
    try {
        // Log the request for debugging
        console.log("POST request received for chapters");
        
        // Parse the request body
        const body = await request.json();
        console.log("Request body for chapters:", body);
        
        // Extract parameters with fallbacks
        const subject = body.subject;
        // Support both naming conventions
        const board = body.board || body.examType || 'CBSE';
        // Support both naming conventions
        const grade = body.grade || body.classLevel || '12';
        
        console.log("Processing chapter request with:", { subject, board, grade });
        
        // Add fallback data in case of errors
        if (!subject) {
            return NextResponse.json(
                { 
                    chapters: [
                        { id: 1, title: "Chapter 1", description: "Fallback chapter", difficulty: "Medium", estimatedStudyHours: 3 },
                        { id: 2, title: "Chapter 2", description: "Fallback chapter", difficulty: "Medium", estimatedStudyHours: 4 }
                    ]
                },
                { status: 200 }
            );
        }
        
        return processChapterRequest(subject, board, grade);
    } catch (error) {
        console.error("Error processing POST request for chapters:", error);
        
        // Return fallback data instead of error
        return NextResponse.json(
            { 
                chapters: [
                    { id: 1, title: "Chapter 1", description: "Fallback chapter", difficulty: "Medium", estimatedStudyHours: 3 },
                    { id: 2, title: "Chapter 2", description: "Fallback chapter", difficulty: "Medium", estimatedStudyHours: 4 }
                ]
            },
            { status: 200 }
        );
    }
}