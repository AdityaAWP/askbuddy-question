'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateRoomPage() {
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCreateRoom = async () => {
    if (!nickname) return alert('Masukkan nickname')

    setLoading(true)
    const res = await fetch('/api/rooms/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      alert(data.error || 'Gagal membuat room')
      return
    }

    // Redirect ke halaman room berdasarkan roomId
    router.push(`/rooms/${data.room.id}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Buat Room Baru</h1>
        <input
          type="text"
          placeholder="Masukkan nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="border border-gray-300 p-3 rounded mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={handleCreateRoom}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-2 rounded"
        >
          {loading ? 'Membuat...' : 'Buat Room'}
        </button>
      </div>
    </div>
  )
}
