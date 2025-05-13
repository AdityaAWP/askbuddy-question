import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request, { params }: { params: { roomId: string } }) {
  const roomId = params.roomId

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single()

  if (roomError) {
    return NextResponse.json({ error: roomError.message }, { status: 404 })
  }

  const { data: guests, error: guestsError } = await supabase
    .from('guests')
    .select('id, nickname, is_host, created_at')
    .eq('room_id', roomId)

  if (guestsError) {
    return NextResponse.json({ error: guestsError.message }, { status: 500 })
  }

  return NextResponse.json({ room, guests }, { status: 200 })
}
