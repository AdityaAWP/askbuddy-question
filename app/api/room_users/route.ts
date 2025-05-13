import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { roomId, userId, isGuest } = await req.json();
  const { data: existingUsers, error: fetchError } = await supabase
    .from('room_users')
    .select('id')
    .eq('room_id', roomId);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 400 });
  }

  if (existingUsers.length >= 8) {
    return NextResponse.json({ error: "Room is full. Cannot add more users." }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from('room_users')
    .insert([
      {
        room_id: roomId,
        user_id: userId,
        is_guest: isGuest,
        is_host: existingUsers.length === 0,
      },
    ]);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  if (existingUsers.length + 1 >= 8) {
    await supabase
      .from('rooms')
      .update({ is_full: true })
      .eq('id', roomId);
  }

  return NextResponse.json(data, { status: 200 });
}
