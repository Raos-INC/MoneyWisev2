import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting MoneyWise development server without database...');
console.log('⚠️  Note: Database features will not work, but you can test the UI');

// Set environment variable to skip database connection
process.env.SKIP_DB = 'true';

// Start the development server
const child = spawn('npx', ['cross-env', 'NODE_ENV=development', 'SKIP_DB=true', 'tsx', resolve(__dirname, '../server/index.ts')], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, SKIP_DB: 'true' }
});

child.on('error', (error) => {
  console.error('❌ Failed to start development server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`\n👋 Development server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  child.kill('SIGTERM');
}); 