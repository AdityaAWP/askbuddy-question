import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { nanoid } from 'nanoid'

export async function POST(req: Request) {
  const body = await req.json()
  const { nickname } = body

  if (!nickname) {
    return NextResponse.json({ error: 'Nickname is required' }, { status: 400 })
  }

  const inviteCode = nanoid(8)

  // 1. Buat Room
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert([{ invite_code: inviteCode }])
    .select()
    .single()

  if (roomError) {
    console.error('Room creation error:', roomError)
    return NextResponse.json({ error: roomError.message }, { status: 500 })
  }

  // 2. Tambahkan host ke room_users sebagai guest dengan is_host: true
  const { data: roomUser, error: roomUserError } = await supabase
    .from('room_users')
    .insert([{
      room_id: room.id,
      guest_id: nickname,          // kamu pakai `text` sebagai guest_id
      is_guest: true,
      is_host: true
    }])
    .select()
    .single()

  if (roomUserError) {
    console.error('RoomUser creation error:', roomUserError)
    return NextResponse.json({ error: roomUserError.message }, { status: 500 })
  }

  return NextResponse.json({ room, host: roomUser }, { status: 200 })
}
