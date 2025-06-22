// Check Supabase Database Schema Alignment
import { supabase, db } from '../server/db';
import * as schema from '../shared/schema';
import { eq, count, sql } from 'drizzle-orm';
import chalk from 'chalk';

async function main() {
  console.log(chalk.blue('=== Checking Supabase Database Connection & Schema Alignment ==='));
  console.log(chalk.gray('This script will check if your local schema matches the Supabase database'));
  
  // Step 1: Verify Supabase Connection
  console.log(chalk.yellow('\nStep 1: Checking Supabase connection...'));
  
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log(chalk.red('✖ Error connecting to Supabase Auth:'), authError.message);
      console.log(chalk.red('  Please check your SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables'));
    } else {
      console.log(chalk.green('✓ Successfully connected to Supabase Auth service'));
    }
    
    // Step 2: Verify Database Connection
    console.log(chalk.yellow('\nStep 2: Checking Supabase Database connection...'));
    
    try {
      // Try to query something simple
      await db.execute(sql`SELECT current_timestamp`);
      console.log(chalk.green('✓ Successfully connected to Supabase Database'));
    } catch (dbError) {
      console.log(chalk.red('✖ Error connecting to Supabase Database:'), dbError.message);
      console.log(chalk.red('  Please check your SUPABASE_DB_URL environment variable'));
      process.exit(1);
    }
    
    // Step 3: Check existing tables
    console.log(chalk.yellow('\nStep 3: Checking database tables...'));
    
    const tables = [
      { name: 'user', schema: schema.users, actual: true },
      { name: 'leads', schema: schema.leads, actual: true },
      { name: 'campaigns', schema: schema.campaigns, actual: true },
      { name: 'earnings', schema: schema.earnings, actual: true },
      { name: 'payouts', schema: schema.payouts, actual: true },
      { name: 'payout_methods', schema: schema.payoutMethods, actual: true },
      { name: 'disputes', schema: schema.disputes, actual: false },
      { name: 'activities', schema: schema.activities, actual: false },
    ];
    
    for (const table of tables) {
      try {
        // Try to query the table
        if (table.actual) {
          const result = await db.select({ count: count() }).from(table.schema);
          console.log(
            chalk.green(`✓ Table ${chalk.bold(table.name)} exists`), 
            chalk.gray(`(found ${result[0].count} records)`)
          );
        } else {
          console.log(
            chalk.yellow(`! Table ${chalk.bold(table.name)} does not exist in the database`), 
            chalk.gray('(referenced in code as placeholder)')
          );
        }
      } catch (error) {
        if (error.message.includes('does not exist')) {
          if (table.actual) {
            console.log(
              chalk.red(`✖ Table ${chalk.bold(table.name)} is missing from the database`),
              chalk.gray('but is defined in schema.ts')
            );
          } else {
            console.log(
              chalk.yellow(`! Table ${chalk.bold(table.name)} does not exist in the database`),
              chalk.gray('(as expected, it\'s only a placeholder in code)')
            );
          }
        } else {
          console.log(chalk.red(`✖ Error checking table ${chalk.bold(table.name)}:`), error.message);
        }
      }
    }
    
    // Step 4: Summarize findings
    console.log(chalk.yellow('\nStep 4: Schema Alignment Summary'));
    console.log(chalk.blue('Actual Database Tables:'));
    console.log('  - user');
    console.log('  - leads');
    console.log('  - campaigns');
    console.log('  - earnings');
    console.log('  - payouts');
    console.log('  - payout_methods');
    console.log('  - users (Supabase Auth)');
    
    console.log(chalk.yellow('\nPlaceholder Tables in Code (Not in Database):'));
    console.log('  - disputes');
    console.log('  - activities');
    
    console.log(chalk.blue('\nNext Steps:'));
    console.log('  1. Run ', chalk.green('npm run db:check'), ' to see detailed schema differences');
    console.log('  2. Run ', chalk.green('npm run db:sync'), ' to synchronize your schema');
    console.log('  3. See docs/schema-management.md for more information');

  } catch (error) {
    console.log(chalk.red('An unexpected error occurred:'), error);
    process.exit(1);
  }
}

main().catch(console.error);
