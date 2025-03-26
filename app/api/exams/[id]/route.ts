import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params
    const params = await context.params;
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch exam from the database
    const examResult = await query(
      "SELECT * FROM public.exams WHERE id = $1 AND user_id = $2",
      [params.id, userId]
    );
    
    if (examResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Exam not found" },
        { status: 404 }
      );
    }

    const exam = examResult.rows[0];

    // Fetch study plan from the database
    const studyPlanResult = await query(
      "SELECT * FROM public.study_plans WHERE exam_id = $1",
      [params.id]
    );

    let studyPlan = null;
    if (studyPlanResult.rows.length > 0) {
      studyPlan = {
        id: studyPlanResult.rows[0].id,
        examId: studyPlanResult.rows[0].exam_id,
        nodes: studyPlanResult.rows[0].nodes,
        edges: studyPlanResult.rows[0].edges,
        createdAt: studyPlanResult.rows[0].created_at,
      };
    }

    return NextResponse.json({ 
      ...exam,
      studyPlan
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
} 