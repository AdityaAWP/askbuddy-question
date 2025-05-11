// A utility to manage guest sessions using localStorage
import { v4 as uuidv4 } from "uuid"

export interface GuestUser {
  id: string
  name: string
  created_at: string
}

export function getGuestUser(): GuestUser | null {
  if (typeof window === "undefined") return null

  const guestUserJson = localStorage.getItem("guestUser")
  if (guestUserJson) {
    return JSON.parse(guestUserJson)
  }
  return null
}

export function createGuestUser(name: string): GuestUser {
  // Generate a proper UUID without any prefix
  const guestUser: GuestUser = {
    id: uuidv4(),
    name,
    created_at: new Date().toISOString(),
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("guestUser", JSON.stringify(guestUser))
  }

  return guestUser
}

export function updateGuestUserName(name: string): GuestUser {
  const currentUser = getGuestUser()
  const updatedUser: GuestUser = {
    ...currentUser!,
    name,
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("guestUser", JSON.stringify(updatedUser))
  }

  return updatedUser
}

export function clearGuestUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("guestUser")
  }
}
