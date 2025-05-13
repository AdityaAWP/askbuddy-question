// app/api/rooms/[inviteCode]/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request, { params }: { params: { inviteCode: string } }) {
  const { nickname } = await req.json()
  const inviteCode = params.inviteCode

  if (!nickname || !inviteCode) {
    return NextResponse.json({ error: 'Nickname and invite code are required' }, { status: 400 })
  }

  // 1. Cari room berdasarkan invite_code
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('invite_code', inviteCode)
    .single()

  if (roomError || !room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  // 2. Hitung total guest
  const { count, error: countError } = await supabase
    .from('room_users')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', room.id)

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  if ((count ?? 0) >= 8) {
    return NextResponse.json({ error: 'Room is full' }, { status: 403 })
  }

  // 3. Tambahkan guest ke room
  const { data: newUser, error: insertError } = await supabase
    .from('room_users')
    .insert([{
      room_id: room.id,
      guest_id: nickname,
      is_guest: true,
      is_host: false,
    }])
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Joined room', room, guest: newUser }, { status: 200 })
}
