import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    const note = await db.query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (note.rows.length === 0) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ note: note.rows[0] });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note' },
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
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { title, content, tags, color } = await request.json();

    // First check if the note exists and belongs to the user
    const existingNote = await db.query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingNote.rows.length === 0) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    const result = await db.query(
      `UPDATE notes 
       SET title = $1, content = $2, tags = $3, color = $4, updated_at = NOW() 
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [
        title || existingNote.rows[0].title,
        content !== undefined ? content : existingNote.rows[0].content,
        tags || existingNote.rows[0].tags,
        color || existingNote.rows[0].color,
        id,
        userId
      ]
    );

    return NextResponse.json({ note: result.rows[0] });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
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
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // First check if the note exists and belongs to the user
    const existingNote = await db.query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingNote.rows.length === 0) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    await db.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
} 