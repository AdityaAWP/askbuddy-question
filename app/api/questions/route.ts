import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('category_id');

  let query = supabase
    .from('questions')
    .select('id, text, created_by, category_id');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data: questions, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(questions);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { question, category_id } = body;

  if (!question || !category_id) {
    return NextResponse.json(
      { error: 'question and category_id are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('questions')
    .insert({ question, category_id })
    .select();

  if (error) {
    console.error('Error inserting question:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ question: data[0] });
}