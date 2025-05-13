import { createClient } from "@supabase/supabase-js"

// Initialize the Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

// Generate a random guest ID
export const generateGuestId = () => {
  return `guest_${Math.random().toString(36).substring(2, 10)}`
}

// Generate a random room code
export const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
