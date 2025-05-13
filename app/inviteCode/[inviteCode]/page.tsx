// app/inviteCode/[inviteCode]/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function JoinRoomPage({ params }: { params: { inviteCode: string } }) {
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleJoin = async () => {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/rooms/${params.inviteCode}`, {
      method: 'POST',
      body: JSON.stringify({ nickname }),
      headers: { 'Content-Type': 'application/json' }
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
    } else {
      router.push(`/rooms/${params.inviteCode}`) // atau halaman bermain
    }
    setLoading(false)
  }

  return (
    <div>
      <h1>Join Room</h1>
      <input
        type="text"
        placeholder="Enter your nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <button onClick={handleJoin} disabled={loading || !nickname}>
        {loading ? 'Joining...' : 'Join Room'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
