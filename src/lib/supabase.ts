import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.SUPABASE_URL || 'https://nbhwnatadyubiuadfakx.supabase.co';
const SUPABASE_SERVICE_KEY = import.meta.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY;

// Pro veřejné operace použít anon key
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY);

// Pro admin operace (server-side only)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
