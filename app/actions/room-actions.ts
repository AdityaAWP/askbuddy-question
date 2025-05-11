"use server"

import { supabaseAdmin } from "@/lib/supabase/service-client"
import { generatePlayerAvatar, SAMPLE_QUESTIONS } from "@/lib/utils"

// Generate a random 6-character room code
function generateRoomCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Removed similar looking characters
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return code
}

// Update the createRoom function to work with the existing schema
export async function createRoom(formData: FormData) {
  const roomName = formData.get("roomName") as string
  const playerName = formData.get("playerName") as string
  const guestId = formData.get("guestId") as string

  if (!roomName || !playerName || !guestId) {
    return { error: "Missing required fields" }
  }

  try {
    // Generate a unique room code
    const roomCode = generateRoomCode()

    // Create room using admin client to bypass RLS
    // Set host_id to null initially to avoid foreign key constraint
    const { data: room, error: roomError } = await supabaseAdmin
      .from("rooms")
      .insert({
        name: roomName,
        host_id: null, // Set to null to avoid foreign key constraint
        code: roomCode,
        status: "setup",
      })
      .select()
      .single()

    if (roomError) throw roomError

    // Generate avatar for host
    const avatar = generatePlayerAvatar(0)

    // Create player record for host
    // Store guest_id in the name field with a prefix to identify it
    const displayName = playerName
    const guestIdentifier = `${displayName}#${guestId.substring(0, 8)}`

    const { data: player, error: playerError } = await supabaseAdmin
      .from("players")
      .insert({
        room_id: room.id,
        user_id: null, // Set to null to avoid foreign key constraint
        name: guestIdentifier, // Store guest ID as part of the name
        color: avatar.color,
        avatar_emoji: avatar.avatar_emoji,
        is_host: true,
      })
      .select()
      .single()

    if (playerError) throw playerError

    // Add 3 sample questions for the host
    const questionsToInsert = SAMPLE_QUESTIONS.slice(0, 3).map((content) => ({
      room_id: room.id,
      creator_id: player.id,
      current_owner_id: player.id,
      content,
    }))

    const { error: questionsError } = await supabaseAdmin.from("questions").insert(questionsToInsert)

    if (questionsError) throw questionsError

    return { success: true, roomId: room.id }
  } catch (error: any) {
    console.error("Error creating room:", error)
    return { error: error.message || "Failed to create room" }
  }
}

export async function joinRoom(formData: FormData) {
  const roomCode = (formData.get("roomCode") as string)?.toUpperCase()
  const playerName = formData.get("playerName") as string
  const guestId = formData.get("guestId") as string

  if (!roomCode || !playerName || !guestId) {
    return { error: "Missing required fields" }
  }

  try {
    // Find room by code
    const { data: room, error: roomError } = await supabaseAdmin.from("rooms").select().eq("code", roomCode).single()

    if (roomError) {
      return { error: "Room not found. Please check the code and try again." }
    }

    // Create guest identifier
    const guestIdentifier = `${playerName}#${guestId.substring(0, 8)}`

    // Check if user is already in this room by checking if the name contains the guest ID
    const { data: players } = await supabaseAdmin.from("players").select().eq("room_id", room.id)

    const existingPlayer = players?.find((p) => {
      // Check if the name contains the guest ID
      const nameParts = p.name.split("#")
      return nameParts.length > 1 && nameParts[1] === guestId.substring(0, 8)
    })

    if (existingPlayer) {
      // User is already in this room
      return { success: true, roomId: room.id, message: "Rejoining room" }
    }

    // Get count of players to determine avatar
    const count = players?.length || 0

    // Generate avatar for new player
    const avatar = generatePlayerAvatar(count)

    // Create player record
    const { data: player, error: playerError } = await supabaseAdmin
      .from("players")
      .insert({
        room_id: room.id,
        user_id: null, // Set to null to avoid foreign key constraint
        name: guestIdentifier, // Store guest ID as part of the name
        color: avatar.color,
        avatar_emoji: avatar.avatar_emoji,
        is_host: false,
      })
      .select()
      .single()

    if (playerError) throw playerError

    return { success: true, roomId: room.id }
  } catch (error: any) {
    console.error("Error joining room:", error)
    return { error: error.message || "Failed to join room" }
  }
}

export async function addQuestion(roomId: string, playerId: string, content: string) {
  if (!content.trim() || !playerId || !roomId) {
    return { error: "Missing required fields" }
  }

  try {
    const { error } = await supabaseAdmin.from("questions").insert([
      {
        room_id: roomId,
        creator_id: playerId,
        current_owner_id: playerId,
        content,
      },
    ])

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error adding question:", error)
    return { error: error.message || "Failed to add question" }
  }
}

export async function startGame(roomId: string) {
  try {
    const { error } = await supabaseAdmin.from("rooms").update({ status: "playing" }).eq("id", roomId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error starting game:", error)
    return { error: error.message || "Failed to start game" }
  }
}

export async function swapQuestion(questionId: string, newOwnerId: string) {
  try {
    const { error } = await supabaseAdmin
      .from("questions")
      .update({ current_owner_id: newOwnerId })
      .eq("id", questionId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error swapping question:", error)
    return { error: error.message || "Failed to swap question" }
  }
}
