import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id, title, description, due_date } = req.body;

    if (!id || !title || !due_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await query(
      "UPDATE tasks SET title = $1, description = $2, due_date = $3 WHERE id = $4 RETURNING *",
      [title, description, due_date, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ task: result.rows[0] });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
