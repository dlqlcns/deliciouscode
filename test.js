const { data, error } = await supabase.from('recipes').select('*').limit(1);
console.log("DB 연결 테스트:", { data, error });
