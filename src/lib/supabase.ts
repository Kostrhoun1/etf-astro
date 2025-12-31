import { createClient } from '@supabase/supabase-js';

// Supabase URL - must be PUBLIC_ prefixed for client-side access
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL || 'https://nbhwnatadyubiuadfakx.supabase.co';

// Anon key for public client-side operations - must be PUBLIC_ prefixed
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

// Service key for server-side admin operations only
const SUPABASE_SERVICE_KEY = import.meta.env.SUPABASE_SERVICE_KEY;

// Pro veřejné operace použít anon key (works both server and client side)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY || '');

// Pro admin operace (server-side only)
export const supabaseAdmin = SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;
