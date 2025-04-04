// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Basic check to ensure variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL and/or Anon Key are missing. Make sure .env file is set up correctly and Vite server might need restarting after .env changes.")
  // You might want to throw an error or handle this more gracefully
  // throw new Error("Supabase URL and Anon Key must be defined.")
}

// Initialize and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)