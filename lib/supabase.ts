import { createClient } from "@supabase/supabase-js"

// Initialize the Supabase client with realtime enabled
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  },
)

// Update the generateGuestId function to be more unique
export const generateGuestId = () => {
  return `guest_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`
}

// Generate a random room code
export const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Create a channel for a room
export const createRoomChannel = (roomCode: string) => {
  return supabase.channel(`room:${roomCode}`, {
    config: {
      broadcast: {
        self: true,
      },
    },
  })
}

// Get guest user from localStorage
export const getGuestUser = () => {
  if (typeof window === "undefined") return null
  const guestId = localStorage.getItem("guestId")
  if (!guestId) return null

  return {
    id: guestId,
    name: `Guest#${guestId.substring(0, 8)}`,
  }
}

// Generate a random color for player avatars
export const generatePlayerColor = () => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-cyan-500",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Generate a random emoji for player avatars
export const generatePlayerEmoji = () => {
  const emojis = ["😀", "😎", "🤠", "🧐", "🤓", "😺", "🐱", "🦊", "🐶", "🐻", "🐼", "🐨", "🦁", "🐯", "🦄"]
  return emojis[Math.floor(Math.random() * emojis.length)]
}
