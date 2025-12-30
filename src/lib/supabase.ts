import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nbhwnatadyubiuadfakx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iaHduYXRhZHl1Yml1YWRmYWt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODg0NDc0NCwiZXhwIjoyMDY0NDIwNzQ0fQ.SI_s72FBMs2qSqhKBsm7ZJSnPOnCEfWn1zQ6nxMtgyo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Alias for compatibility with Next.js code
export const supabaseAdmin = supabase;
