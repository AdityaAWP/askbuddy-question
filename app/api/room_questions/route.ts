import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { roomId, userId, questionId } = await req.json();
  const { data: existingQuestions, error: fetchError } = await supabase
    .from('room_questions')
    .select('id')
    .eq('room_id', roomId)
    .eq('user_id', userId);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 400 });
  }

  if (existingQuestions.length >= 3) {
    return NextResponse.json({ error: "Anda sudah mencapai batas 3 pertanyaan." }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from('room_questions')
    .insert([
      {
        room_id: roomId,
        user_id: userId,
        question_id: questionId,
        round: existingQuestions.length + 1, 
      },
    ]);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 200 });
}
