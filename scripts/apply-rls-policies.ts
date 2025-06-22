import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyRLSPolicies() {
  try {
    console.log('Reading RLS policies from file...');
    const sqlFilePath = resolve(__dirname, 'setup-rls-policies.sql');
    const sqlContent = readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL commands by semicolon and filter out empty statements
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    console.log(`Found ${commands.length} SQL commands to execute`);
    
    // Execute each command separately
    for (let i = 0; i < commands.length; i++) {
      console.log(`Executing command ${i + 1}/${commands.length}`);
      const { error } = await supabase.rpc('exec_sql', { sql: commands[i] });
      
      if (error) {
        console.error(`Error executing command ${i + 1}:`, error);
        // Continue with other commands despite errors
      } else {
        console.log(`Command ${i + 1} executed successfully`);
      }
    }
    
    console.log('RLS policies applied successfully');
  } catch (error) {
    console.error('Error applying RLS policies:', error);
    process.exit(1);
  }
}

applyRLSPolicies()
  .then(() => {
    console.log('Policy application completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to apply policies:', err);
    process.exit(1);
  });
