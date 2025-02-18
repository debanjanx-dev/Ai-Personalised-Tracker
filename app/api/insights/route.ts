import { GoogleGenerativeAI } from '@google/generative-ai';
import { query } from '../../../lib/db';
import { NextApiRequest, NextApiResponse } from '@/node_modules/next/types';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Check for API key first
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ message: "Gemini API key is not configured" });
    }

    // Method check
    if (req.method !== 'GET') {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        // Fetch tasks
        const response = await query("SELECT * FROM tasks ORDER BY created_at DESC");
        const tasks = response.rows;

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found" });
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
            return res.status(500).json({ message: "No response generated from Gemini" });
        }

        // Return successful response
        return res.status(200).json({ 
            tasks,
            analysis: response_text 
        });

    } catch (error: any) {
        console.error("Error in API handler:", error);
        
        // Handle specific Gemini API errors
        if (error.message?.includes('API key')) {
            return res.status(401).json({ 
                message: "Invalid Gemini API key. Please check your configuration." 
            });
        }

        if (error.message?.includes('quota')) {
            return res.status(402).json({ 
                message: "Gemini API quota exceeded. Please check your usage and billing settings." 
            });
        }

        return res.status(500).json({ 
            message: "Internal Server Error",
            error: error.message 
        });
    }
}