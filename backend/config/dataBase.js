import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../..', '.env') });

// Configura las credenciales de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Crea el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
