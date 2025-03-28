// @ts-ignore

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// Update the type definition to match Next.js expectations
interface RequestContext {
  params: {
    id: string; // Use id since the folder is named [id]
  }
}

// Fix for the GET function - you need to replace slug with id
// Remove the custom interface and use the exact pattern Next.js expects
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request);
    const id = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch exam from the database using db.query instead of query
    const examResult = await db.query(
      "SELECT * FROM public.exams WHERE id = $1 AND user_id = $2",
      [id, userId]  // Changed from slug to id
    );

    if (examResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      );
    }

    const exam = examResult.rows[0];

    // Fetch study plan if it exists
    const studyPlanResult = await db.query(
      "SELECT * FROM public.study_plans WHERE exam_id = $1",
      [id]  // Changed from slug to id
    );

    let studyPlan = null;
    if (studyPlanResult.rows.length > 0) {
      const planData = studyPlanResult.rows[0];
      studyPlan = {
        nodes: planData.nodes,
        edges: planData.edges
      };
    }

    return NextResponse.json({
      ...exam,
      studyPlan
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exam' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request);
    const id = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, subject, date, duration, description } = await request.json();

    // Validate required fields
    if (!title || !subject || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if exam exists and belongs to user
    const checkResult = await db.query(
      "SELECT id FROM public.exams WHERE id = $1 AND user_id = $2",
      [id, userId]  // Changed from slug to id
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Exam not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update exam
    const result = await db.query(
      `UPDATE public.exams 
       SET title = $1, subject = $2, date = $3, duration = $4, description = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title, subject, date, duration, description || '', id, userId]  // Changed from slug to id
    );

    return NextResponse.json({ exam: result.rows[0] });
  } catch (error) {
    console.error('Error updating exam:', error);
    return NextResponse.json(
      { error: 'Failed to update exam' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request);
    const id = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if exam exists and belongs to user
    const checkResult = await db.query(
      "SELECT id FROM public.exams WHERE id = $1 AND user_id = $2",
      [id, userId]  // Changed from slug to id
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Exam not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete associated study plan if it exists
    await db.query(
      "DELETE FROM public.study_plans WHERE exam_id = $1",
      [id]  // Changed from slug to id
    );

    // Delete exam
    await db.query(
      "DELETE FROM public.exams WHERE id = $1 AND user_id = $2",
      [id, userId]  // Changed from slug to id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting exam:', error);
    return NextResponse.json(
      { error: 'Failed to delete exam' },
      { status: 500 }
    );
  }
}