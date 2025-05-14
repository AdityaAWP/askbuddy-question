"use server"

import { supabase } from "@/lib/supabase"

export async function addQuestion(roomId: string, playerId: string, content: string) {
  try {
    const { data, error } = await supabase
      .from("question_cards")
      .insert({
        room_id: roomId,
        guest_id: playerId,
        question: content,
        current_owner_id: playerId,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("Error adding question:", error)
    return { error: error.message || "Failed to add question" }
  }
}

export async function startGame(roomId: string) {
  try {
    // Update room status
    const { error: updateError } = await supabase.from("rooms").update({ status: "playing" }).eq("id", roomId)

    if (updateError) throw updateError

    return { success: true }
  } catch (error: any) {
    console.error("Error starting game:", error)
    return { error: error.message || "Failed to start game" }
  }
}

export async function swapQuestion(questionId: string, newOwnerId: string) {
  try {
    const { error } = await supabase
      .from("question_cards")
      .update({ current_owner_id: newOwnerId })
      .eq("id", questionId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error swapping question:", error)
    return { error: error.message || "Failed to swap question" }
  }
}
