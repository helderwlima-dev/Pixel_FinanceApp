import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// A palavra "export" aqui é obrigatória para o App.jsx conseguir ler esta variável
export const supabase = createClient(supabaseUrl, supabaseKey);