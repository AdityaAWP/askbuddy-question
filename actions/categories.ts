'use server'

import { supabase } from '@/lib/supabase'


export async function GetCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, created_at')

  if (error) {
    throw new Error(error.message)
  }
  return data
}

export async function CreateCategory(name: string) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name })
    .select()

  if (error) {
    throw new Error(error.message)
  }
  return data[0]
}