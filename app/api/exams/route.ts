import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

//@ts-ignore
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user using getAuth with the request
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get all exams for the user using direct SQL query
    const result = await db.query(
      "SELECT * FROM exams WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    
    // Return with "exams" property to match what the frontend expects
    return NextResponse.json({ exams: result.rows });
  } catch (error: any) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { error: `Failed to fetch exams: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user using getAuth with the request
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    const { title, subject, date, board, class: classLevel } = body;
    
    if (!title || !subject || !date || !board || !classLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: title, subject, and date are required' },
        { status: 400 }
      );
    }
    
    // First, let's check the actual schema of the exams table
    try {
      const tableInfo = await db.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'exams'"
      );
      console.log('Available columns in exams table:', tableInfo.rows.map(r => r.column_name));
    } catch (err) {
      console.log('Could not fetch table schema:', err);
    }
    
    // Create a new exam in the database using direct SQL query
    const result = await db.query(
      `INSERT INTO exams (
        title, subject, board, class, date, user_id, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NOW()
      ) RETURNING *`,
      [
        title,
        subject,
        board,
        classLevel,
        new Date(date),
        userId
      ]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating exam:', error);
    return NextResponse.json(
      { error: `Failed to create exam: ${error.message}` },
      { status: 500 }
    );
  }
}