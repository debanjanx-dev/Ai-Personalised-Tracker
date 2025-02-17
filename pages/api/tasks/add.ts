import { query } from './../../../lib/db';
import { NextApiRequest, NextApiResponse } from "@/node_modules/next/types";


export default async function handler (req : NextApiRequest, res : NextApiResponse) {
    if (req.method != "POST") {
        res.status(405).json({
            message : "method not allowed"
        })
    }

    try {
        const {title , description , due_date } = req.body;
        if(!title || !description || !due_date) {
            res.status(400).json({
                message : "title and description are required"
            })
        }
        //add data to database 
        const result = await query(
            "INSERT INTO tasks (title, description ,due_date) VALUES ($1, $2 , $3) RETURNING *",
            [title, description ,due_date]
        );
    } catch (error) {
        console.error("Error adding task:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
} 