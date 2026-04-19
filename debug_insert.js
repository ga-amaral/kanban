const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eefxkltwztxsifcexldy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZnhrbHR3enR4c2lmY2V4bGR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU1NTcyNCwiZXhwIjoyMDg1MTMxNzI0fQ.1FW7na01JUrtSv9SFqnahz7E7I6e2FDpBzMpm7HKEvI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    // Tenta inserir um card vazio e ver o erro detalhado ou as colunas esperadas
    const { data, error } = await supabase.from('cards').insert({}).select();
    console.log('Error:', JSON.stringify(error, null, 2));
}

check();
