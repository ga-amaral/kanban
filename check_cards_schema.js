const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eefxkltwztxsifcexldy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZnhrbHR3enR4c2lmY2V4bGR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU1NTcyNCwiZXhwIjoyMDg1MTMxNzI0fQ.1FW7na01JUrtSv9SFqnahz7E7I6e2FDpBzMpm7HKEvI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase.rpc('execute_sql', {
        query: "SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'cards';"
    });
    // If RPC execute_sql is not available (likely), use a different approach.
    // Try to insert a dummy row to see what fails or use a direct query if possible.
    // Actually, I'll try to just select from information_schema via a normal query.
}

async function checkColumns() {
    const { data, error } = await supabase.from('cards').select('*').limit(1);
    // This doesn't give us nullability.
    
    // Let's try to find out which columns exist and are not null.
    const { data: cols, error: err } = await supabase.rpc('get_table_info', { table_name: 'cards' }).catch(() => ({ data: null }));
    
    // Best way: select from information_schema.columns directly if allowed.
    const { data: columns, error: colError } = await supabase
        .from('information_schema.columns')
        .select('column_name, is_nullable')
        .eq('table_name', 'cards');
    
    if (colError) {
        console.log('Error checking columns:', colError.message);
    } else {
        console.log('Columns:', columns);
    }
}

checkColumns();
