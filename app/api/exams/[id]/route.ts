// @ts-ignore

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// Define context type with slug instead of id
type Context = {
  params: {
    slug: string;
  };
};

export async function GET(
  request: NextRequest,
  context: Promise<Context> 
) {
  try {
    const { userId } = getAuth(request);
    const resolvedContext = await context;
    const { slug } = resolvedContext.params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch exam from the database using db.query instead of query
    const examResult = await db.query(
      "SELECT * FROM public.exams WHERE id = $1 AND user_id = $2",
      [slug, userId]
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
      [slug] // Use slug instead of id
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
  context: Promise<Context>
) {
  try {
    const { userId } = getAuth(request);
    const resolvedContext = await context;
    const { slug } = resolvedContext.params;
    
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
      [slug, userId] // Use slug instead of id
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
      [title, subject, date, duration, description || '', slug, userId] // Use slug instead of id
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
  context: Promise<Context>
) {
  try {
    const { userId } = getAuth(request);
    const resolvedContext = await context;
    const { slug } = resolvedContext.params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if exam exists and belongs to user
    const checkResult = await db.query(
      "SELECT id FROM public.exams WHERE id = $1 AND user_id = $2",
      [slug, userId]
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
      [slug] // Changed from id to slug
    );

    // Delete exam
    await db.query(
      "DELETE FROM public.exams WHERE id = $1 AND user_id = $2",
      [slug, userId] // Changed from id to slug
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