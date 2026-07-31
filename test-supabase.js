import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config(); // try to load .env if it exists somewhere

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "YOUR_URL";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "YOUR_KEY";

// Read from vite config or env?
