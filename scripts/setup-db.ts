import { readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

async function setupDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nPlease set these in your .env.local file or environment variables.');
    process.exit(1);
  }

  console.log('🔧 Setting up Supabase database schema...\n');

  try {
    // Read SQL file
    const sqlPath = join(process.cwd(), 'scripts', 'setup-db.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    // Try to use Supabase CLI if available
    try {
      console.log('📦 Attempting to use Supabase CLI...\n');
      
      // Check if supabase CLI is installed
      execSync('which supabase', { stdio: 'ignore' });
      
      // Extract project reference from URL (format: https://xxxxx.supabase.co)
      const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
      
      if (projectRef) {
        console.log(`   Using project: ${projectRef}\n`);
        
        // Write SQL to a temp file for supabase CLI
        const tempSqlPath = join(process.cwd(), 'scripts', 'temp-migration.sql');
        require('fs').writeFileSync(tempSqlPath, sql);
        
        // Execute using supabase CLI
        // Note: This requires supabase CLI to be linked to the project
        // Alternative: Use psql with connection string
        console.log('⚠️  Supabase CLI requires project linking.');
        console.log('   Using alternative method...\n');
      }
    } catch (cliError) {
      // Supabase CLI not available, use alternative method
      console.log('📝 Supabase CLI not found. Using alternative method...\n');
    }

    // Alternative: Execute SQL via Management API or provide instructions
    console.log('📋 SQL Schema to Execute:');
    console.log('─'.repeat(60));
    console.log(sql);
    console.log('─'.repeat(60));
    console.log('\n');

    // Try to execute via Supabase Management API
    try {
      // Extract project ID from URL
      const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
      
      if (projectId) {
        // Use Supabase Management API to execute SQL
        // This requires the access token from Supabase Dashboard
        console.log('💡 To execute this SQL automatically, you can:');
        console.log('   1. Use Supabase Dashboard SQL Editor (recommended)');
        console.log('   2. Install Supabase CLI: npm install -g supabase');
        console.log('   3. Use psql with your database connection string\n');
        
        console.log('🔗 Quick Links:');
        console.log(`   Dashboard: https://app.supabase.com/project/${projectId}/sql/new\n`);
      }
    } catch (apiError) {
      // Fall through to manual instructions
    }

    console.log('✅ SQL file ready at: scripts/setup-db.sql');
    console.log('\n📝 Next Steps:');
    console.log('   1. Open Supabase Dashboard: https://app.supabase.com');
    console.log('   2. Select your project');
    console.log('   3. Go to SQL Editor');
    console.log('   4. Copy and paste the SQL above (or from scripts/setup-db.sql)');
    console.log('   5. Click "Run" to execute\n');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

setupDatabase();
