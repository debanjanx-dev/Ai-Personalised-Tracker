import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch exams from the database using db.query instead of query
    const result = await db.query(
      "SELECT * FROM public.exams WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    return NextResponse.json({ exams: result.rows });
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, subject, date, duration, description } = await request.json();

    // Validate required fields
    if (!title || !subject || !date || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert exam into the database using db.query instead of query
    const result = await db.query(
      `INSERT INTO public.exams (user_id, title, subject, date, duration, description, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
      [userId, title, subject, date, duration, description || '']
    );

    return NextResponse.json({ exam: result.rows[0] });
  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json(
      { error: 'Failed to create exam' },
      { status: 500 }
    );
  }
} 