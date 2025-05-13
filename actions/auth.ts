'use server'
import { supabase } from '@/lib/supabase'

// Login using email and password
export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    throw new Error(error.message)
  }
  return data.user
}

// Sign up a new user with email and password
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    throw new Error(error.message)
  }
  return data.user
}

// Log out the current user
export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(error.message)
  }
}