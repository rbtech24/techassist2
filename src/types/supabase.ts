export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          timestamp: string
          appliance: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          timestamp?: string
          appliance?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          timestamp?: string
          appliance?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          timestamp: string
          error: string | null
          qr_data: string | null
          images: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          timestamp?: string
          error?: string | null
          qr_data?: string | null
          images?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant'
          content?: string
          timestamp?: string
          error?: string | null
          qr_data?: string | null
          images?: string[] | null
          created_at?: string
        }
      }
    }
  }
}