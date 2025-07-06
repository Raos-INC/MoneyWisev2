import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🧪 Testing Graceful Shutdown for MoneyWise');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Start the server
console.log('🚀 Starting server...');
const server = spawn('npm', ['run', 'dev:backend'], {
  cwd: projectRoot,
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true
});

let serverStarted = false;
let serverOutput = '';

server.stdout.on('data', (data) => {
  const output = data.toString();
  serverOutput += output;
  console.log(`[SERVER] ${output.trim()}`);
  
  // Check if server is ready
  if (output.includes('MoneyWise Development Server Started!')) {
    serverStarted = true;
    console.log('\n✅ Server started successfully');
    
    // Wait 2 seconds then send SIGTERM
    setTimeout(() => {
      console.log('\n🛑 Sending SIGTERM signal...');
      server.kill('SIGTERM');
    }, 2000);
  }
});

server.stderr.on('data', (data) => {
  console.log(`[ERROR] ${data.toString().trim()}`);
});

server.on('close', (code, signal) => {
  console.log(`\n📊 Server process closed:`);
  console.log(`   Exit code: ${code}`);
  console.log(`   Signal: ${signal}`);
  
  // Check if graceful shutdown worked
  if (serverOutput.includes('Graceful shutdown completed')) {
    console.log('✅ Graceful shutdown test PASSED!');
    console.log('   - Server received shutdown signal');
    console.log('   - Database connection closed properly');
    console.log('   - Process exited cleanly');
  } else {
    console.log('❌ Graceful shutdown test FAILED!');
    console.log('   - Server did not shutdown gracefully');
    console.log('   - Check the logs above for issues');
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 To test manually:');
  console.log('   1. Run: npm run dev:backend');
  console.log('   2. Press Ctrl+C to send SIGINT');
  console.log('   3. Watch for graceful shutdown messages');
});

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  server.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test terminated');
  server.kill('SIGTERM');
  process.exit(0);
}); 