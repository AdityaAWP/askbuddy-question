import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: { roomId: string } }) {
  const { roomId } = params

  const { data, error } = await supabase
    .from('room_users')
    .select('*')
    .eq('room_id', roomId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ guests: data }, { status: 200 })
}
