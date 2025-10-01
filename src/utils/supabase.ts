import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/index";

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY as string;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error("Missing VITE_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_KEY environment variable");
}

// Create and export the Supabase client with proper typing
export const supabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
