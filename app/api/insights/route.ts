import { GoogleGenerativeAI } from '@google/generative-ai';
import { query } from '../../../lib/db';
import { NextResponse } from 'next/server';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function GET() {
    // Check for API key first
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
            { message: "Gemini API key is not configured" },
            { status: 500 }
        );
    }

    try {
        // Fetch tasks
        const response = await query("SELECT * FROM tasks ORDER BY created_at DESC");
        const tasks = response.rows;

        if (!tasks || tasks.length === 0) {
            return NextResponse.json(
                { message: "No tasks found" },
                { status: 404 }
            );
        }

        // Create task descriptions
        const taskDescriptions = tasks.map(
            (task) => `- Task: ${task.title}, Due: ${task.due_date}, Description: ${task.description}`
        ).join("\n");

        // Create prompt
        const prompt = `
            Act as an academic advisor. Analyze the following academic tasks and provide insights:
            1. Identify which tasks are urgent.
            2. Suggest how to prioritize them.
            3. Recommend any study techniques or tools that can help.
            4. If tasks are overdue, suggest how to handle them.

            Tasks:
            ${taskDescriptions}
        `;

        // Generate content with Gemini
        const result = await model.generateContent(prompt);
        const response_text = await result.response.text();

        if (!response_text) {
            return NextResponse.json(
                { message: "No response generated from Gemini" },
                { status: 500 }
            );
        }

        // Return successful response
        return NextResponse.json({ 
            tasks,
            analysis: response_text 
        });

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