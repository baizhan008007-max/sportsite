import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabaseConfigError =
  !supabaseUrl || !supabaseKey
    ? 'Не настроено подключение к базе данных. Проверь переменные окружения VITE_SUPABASE_URL и VITE_SUPABASE_PUBLISHABLE_KEY.'
    : null

export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl, supabaseKey)
