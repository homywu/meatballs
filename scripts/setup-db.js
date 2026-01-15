const { readFileSync, existsSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

// Load .env.local if it exists
try {
  const envPath = join(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const envFile = readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match && !process.env[match[1].trim()]) {
        process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    });
  }
} catch (error) {
  // Ignore errors loading .env.local
}

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

    // Extract project ID from URL
    const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

    console.log('📋 SQL Schema to Execute:');
    console.log('─'.repeat(60));
    console.log(sql);
    console.log('─'.repeat(60));
    console.log('\n');

    // Check if Supabase CLI is available
    let hasSupabaseCLI = false;
    try {
      execSync('which supabase', { stdio: 'ignore' });
      hasSupabaseCLI = true;
    } catch {
      // CLI not available
    }

    if (hasSupabaseCLI) {
      console.log('💡 Supabase CLI detected!');
      console.log('   You can also use: supabase db push\n');
    }

    console.log('✅ SQL file ready at: scripts/setup-db.sql');
    console.log('\n📝 Next Steps:');
    console.log('   1. Open Supabase Dashboard: https://app.supabase.com');
    if (projectId) {
      console.log(`   2. Select your project (ID: ${projectId})`);
    } else {
      console.log('   2. Select your project');
    }
    console.log('   3. Go to SQL Editor (left sidebar)');
    console.log('   4. Click "New query"');
    console.log('   5. Copy and paste the SQL above (or from scripts/setup-db.sql)');
    console.log('   6. Click "Run" (or press Cmd/Ctrl + Enter) to execute\n');
    console.log('   Or use Supabase CLI:');
    console.log('   - Install: npm install -g supabase');
    console.log('   - Link: supabase link --project-ref ' + (projectId || 'YOUR_PROJECT_REF'));
    console.log('   - Push: supabase db push\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
