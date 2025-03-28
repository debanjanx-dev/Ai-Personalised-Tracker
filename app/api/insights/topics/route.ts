import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Helper function to process topic requests
async function processTopicRequest(subject: string | null, chapter: string | null, board: string = 'CBSE', grade: string = '12') {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
            { message: "Gemini API key is not configured" },
            { status: 500 }
        );
    }

    if (!subject || !chapter) {
        return NextResponse.json(
            { message: "Subject and chapter parameters are required" },
            { status: 400 }
        );
    }

    try {
        // Create prompt for Gemini
        const prompt = `
            Act as an educational expert for ${board} board, class ${grade}.
            
            Please provide a detailed study plan for the chapter "${chapter}" in the subject "${subject}".
            
            Format your response as a JSON object with the following structure:
            {
                "topics": [
                    {
                        "id": 1,
                        "title": "Topic Title",
                        "description": "Detailed description of what this topic covers",
                        "keyPoints": ["Key point 1", "Key point 2"],
                        "difficulty": "Easy/Medium/Hard",
                        "estimatedStudyHours": 2,
                        "priority": "High/Medium/Low",
                        "prerequisites": ["Topic X", "Topic Y"]
                    }
                ],
                "flowData": {
                    "nodes": [
                        { "id": "1", "position": { "x": 0, "y": 0 }, "data": { "label": "Topic 1" } }
                    ],
                    "edges": [
                        { "id": "e1-2", "source": "1", "target": "2" }
                    ]
                },
                "recommendedResources": [
                    {
                        "title": "Resource Title",
                        "type": "Video/Book/Article",
                        "description": "Brief description of the resource"
                    }
                ]
            }
            
            Provide only the JSON object without any additional text or explanation.
            For the flowData, create a logical learning path that shows the optimal order to study the topics.
        `;

        // Generate content with Gemini
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();

        // Parse the JSON response
        try {
            // Extract JSON from the response (in case Gemini adds extra text)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("Could not extract JSON from response");
            }
            
            const studyPlan = JSON.parse(jsonMatch[0]);
            
            // Return successful response
            return NextResponse.json(studyPlan);
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
    const chapter = searchParams.get('chapter');
    const board = searchParams.get('board') || 'CBSE';
    const grade = searchParams.get('grade') || '12';
    
    return processTopicRequest(subject, chapter, board, grade);
}

// POST method handler
export async function POST(request: Request) {
    console.log("POST request received for topics");
    
    try {
        // Parse the request body
        const body = await request.json();
        console.log("Request body for topics:", body);
        
        // Extract parameters with fallbacks and handle different naming conventions
        const subject = body.subject;
        const chapter = body.chapter;
        // Support both naming conventions (board/examType)
        const board = body.board || body.examType || 'CBSE';
        // Support both naming conventions (grade/classLevel)
        const grade = body.grade || body.classLevel || '12';
        
        console.log("Processing topic request with:", { subject, chapter, board, grade });
        
        return processTopicRequest(subject, chapter, board, grade);
    } catch (error) {
        console.error("Error processing POST request for topics:", error);
        return NextResponse.json(
            { message: "Invalid request body", error: error instanceof Error ? error.message : String(error) },
            { status: 400 }
        );
    }
}