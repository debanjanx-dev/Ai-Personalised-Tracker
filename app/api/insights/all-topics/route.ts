import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Define interface for the response structure
interface TopicsResponse {
    topicsByChapter: Record<string, string[]>;
}

// Helper function to process all topics request
async function processAllTopicsRequest(subject: string | null, chapters: string[] | null, board: string = 'CBSE', grade: string = '12') {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
            { message: "Gemini API key is not configured" },
            { status: 500 }
        );
    }

    if (!subject || !chapters || chapters.length === 0) {
        return NextResponse.json(
            { message: "Subject and chapters parameters are required" },
            { status: 400 }
        );
    }

    try {
        // Create prompt for Gemini
        const prompt = `
            Act as an educational expert for ${board} board, class ${grade}.
            
            Please provide topics for the following chapters in the subject "${subject}":
            ${chapters.map(chapter => `- ${chapter}`).join('\n')}
            
            Format your response as a JSON object with the following structure:
            {
                "topicsByChapter": {
                    "Chapter 1 Title": ["Topic 1", "Topic 2", "Topic 3"],
                    "Chapter 2 Title": ["Topic 1", "Topic 2", "Topic 3"],
                    ...
                }
            }
            
            Provide only the JSON object without any additional text or explanation.
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
            
            const data = JSON.parse(jsonMatch[0]) as TopicsResponse;
            
            // Return successful response
            return NextResponse.json(data);
        } catch (parseError) {
            console.error("Error parsing Gemini response:", parseError);
            
            // Create fallback data with proper typing
            const fallbackData: TopicsResponse = {
                topicsByChapter: {}
            };
            
            chapters.forEach(chapter => {
                fallbackData.topicsByChapter[chapter] = [
                    `Introduction to ${chapter}`,
                    `Key concepts in ${chapter}`,
                    `Applications of ${chapter}`
                ];
            });
            
            return NextResponse.json(fallbackData);
        }
    } catch (error: any) {
        console.error("Error in API handler:", error);
        
        // Create fallback data with proper typing
        const fallbackData: TopicsResponse = {
            topicsByChapter: {}
        };
        
        chapters.forEach(chapter => {
            fallbackData.topicsByChapter[chapter] = [
                `Introduction to ${chapter}`,
                `Key concepts in ${chapter}`,
                `Applications of ${chapter}`
            ];
        });
        
        return NextResponse.json(fallbackData);
    }
}

// POST method handler
export async function POST(request: Request) {
    try {
        // Parse the request body
        const body = await request.json();
        console.log("Request body for all-topics:", body);
        
        // Extract parameters with fallbacks
        const subject = body.subject;
        const chapters = body.chapters || [];
        // Support both naming conventions
        const board = body.board || body.examType || 'CBSE';
        // Support both naming conventions
        const grade = body.grade || body.classLevel || '12';
        
        console.log("Processing all-topics request with:", { subject, chapters, board, grade });
        
        return processAllTopicsRequest(subject, chapters, board, grade);
    } catch (error) {
        console.error("Error processing POST request for all-topics:", error);
        return NextResponse.json(
            { message: "Invalid request body", error: error instanceof Error ? error.message : String(error) },
            { status: 400 }
        );
    }
}