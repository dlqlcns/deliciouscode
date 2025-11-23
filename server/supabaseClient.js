import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Render에 입력된 키 그대로 사용

if (!supabaseUrl || !supabaseKey) {
  throw new Error('🚨 SUPABASE_URL 또는 SUPABASE_KEY 환경 변수가 없습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
