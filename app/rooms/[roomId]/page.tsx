// app/rooms/[roomId]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RoomPage() {
  const { roomId } = useParams()
  const [room, setRoom] = useState<any>(null)
  const [guests, setGuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoomData = async () => {
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (roomError || !roomData) {
      setError('Room not found')
      setLoading(false)
      return
    }

    setRoom(roomData)

    const { data: guestsData, error: guestError } = await supabase
      .from('room_users')
      .select('*')
      .eq('room_id', roomId)

    if (!guestError && guestsData) {
      setGuests(guestsData)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchRoomData()
  }, [])

  const handleCopyLink = () => {
    if (!room?.invite_code) return
    const link = `${window.location.origin}/rooms/${room.invite_code}`
    navigator.clipboard.writeText(link)
    alert('Invite link copied to clipboard!')
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-6">
        <h1 className="text-2xl font-bold mb-4">Room Info</h1>
        <p className="mb-2">
          Invite Code:{' '}
          <code className="bg-gray-200 px-2 py-1 rounded">{room.invite_code}</code>
        </p>
        <p className="mb-2">
          Created At: {new Date(room.created_at).toLocaleString()}
        </p>
        <p className="mb-2">
          Is Full: {room.is_full ? 'Yes' : 'No'}
        </p>
        <button
          onClick={handleCopyLink}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Invite Guest (Copy Link)
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Guests in Room</h2>
        {guests.length === 0 ? (
          <p>No guests joined yet.</p>
        ) : (
          <ul className="space-y-2">
            {guests.map((guest) => (
              <li
                key={guest.id}
                className="border border-gray-200 p-3 rounded bg-gray-50"
              >
                <p className="font-medium">
                  {guest.is_guest ? guest.guest_id : `User: ${guest.user_id}`}
                </p>
                {guest.is_host && (
                  <span className="text-sm text-green-600">Host</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
