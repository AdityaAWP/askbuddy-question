// 'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CreateRoomPage = () => {
    const router = useRouter();
    const [inviteCode, setInviteCode] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateRoom = async () => {
  if (!inviteCode || !startTime || !endTime) {
    setError('All fields are required!');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const response = await fetch('/api/rooms', {
      method: 'POST',  // Pastikan menggunakan POST di sini
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invite_code: inviteCode,
        start_time: startTime,
        end_time: endTime,
      }),
    });

    const data = await response.json();

    if (data.success) {
      router.push(`/rooms/${data.roomId}`);
    } else {
      setError(data.error || 'Failed to create room');
    }
  } catch (err) {
    setError('An error occurred while creating the room');
  } finally {
    setLoading(false);
  }
};



    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
            <h1 className="text-2xl font-bold mb-6">Create Room</h1>

            <div className="mb-4">
                <label htmlFor="invite_code" className="block mb-1 font-medium">
                    Invite Code
                </label>
                <input
                    type="text"
                    id="invite_code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="start_time" className="block mb-1 font-medium">
                    Start Time
                </label>
                <input
                    type="datetime-local"
                    id="start_time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="end_time" className="block mb-1 font-medium">
                    End Time
                </label>
                <input
                    type="datetime-local"
                    id="end_time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                />
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
            >
                {loading ? 'Creating...' : 'Create Room'}
            </button>
        </div>
    );
};

export default CreateRoomPage;
