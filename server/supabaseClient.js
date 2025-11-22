// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wskxzuzyxnsywmyqeppt.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)
