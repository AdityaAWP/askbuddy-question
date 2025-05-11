export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          name: string
          host_id: string | null
          code: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          host_id?: string | null
          code?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          host_id?: string | null
          code?: string
          status?: string
          created_at?: string
        }
      }
      players: {
        Row: {
          id: string
          room_id: string
          user_id: string | null
          name: string
          color: string
          avatar_emoji: string
          is_host: boolean
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id?: string | null
          name: string
          color: string
          avatar_emoji: string
          is_host?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string | null
          name?: string
          color?: string
          avatar_emoji?: string
          is_host?: boolean
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          room_id: string
          creator_id: string
          current_owner_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          creator_id: string
          current_owner_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          creator_id?: string
          current_owner_id?: string
          content?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
