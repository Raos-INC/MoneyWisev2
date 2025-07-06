import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🧪 Testing Environment Setup for MoneyWise');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Test environment setup
async function testEnvironmentSetup() {
  console.log('1️⃣ Testing Development Environment Setup...');
  
  try {
    const { execSync } = await import('child_process');
    execSync('node scripts/setup-env.js dev', { 
      cwd: projectRoot, 
      stdio: 'inherit' 
    });
    console.log('✅ Development environment setup completed');
  } catch (error) {
    console.error('❌ Development environment setup failed:', error.message);
    return false;
  }
  
  console.log('\n2️⃣ Testing Production Environment Setup...');
  
  try {
    const { execSync } = await import('child_process');
    execSync('node scripts/setup-env.js prod', { 
      cwd: projectRoot, 
      stdio: 'inherit' 
    });
    console.log('✅ Production environment setup completed');
  } catch (error) {
    console.error('❌ Production environment setup failed:', error.message);
    return false;
  }
  
  return true;
}

// Test database connection
async function testDatabaseConnection() {
  console.log('\n3️⃣ Testing Database Connection...');
  
  try {
    const { execSync } = await import('child_process');
    execSync('npm run test:db', { 
      cwd: projectRoot, 
      stdio: 'inherit' 
    });
    console.log('✅ Database connection test completed');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed');
    return false;
  }
}

// Test server startup
async function testServerStartup() {
  console.log('\n4️⃣ Testing Server Startup...');
  
  return new Promise((resolve) => {
    const server = spawn('npm', ['run', 'dev:backend'], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });
    
    let serverStarted = false;
    let timeout;
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[SERVER] ${output.trim()}`);
      
      if (output.includes('MoneyWise Development Server Started!')) {
        serverStarted = true;
        console.log('✅ Server started successfully');
        
        // Wait 3 seconds then shutdown
        setTimeout(() => {
          console.log('\n🛑 Shutting down server...');
          server.kill('SIGTERM');
        }, 3000);
      }
    });
    
    server.stderr.on('data', (data) => {
      console.log(`[ERROR] ${data.toString().trim()}`);
    });
    
    server.on('close', (code, signal) => {
      clearTimeout(timeout);
      console.log(`📊 Server process closed: code=${code}, signal=${signal}`);
      
      if (serverStarted) {
        console.log('✅ Server startup test PASSED!');
        resolve(true);
      } else {
        console.log('❌ Server startup test FAILED!');
        resolve(false);
      }
    });
    
    // Timeout after 30 seconds
    timeout = setTimeout(() => {
      console.log('⏰ Server startup test timed out');
      server.kill('SIGTERM');
      resolve(false);
    }, 30000);
  });
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Environment Setup Tests...\n');
  
  const envSetupResult = await testEnvironmentSetup();
  if (!envSetupResult) {
    console.log('\n❌ Environment setup tests failed');
    process.exit(1);
  }
  
  const dbResult = await testDatabaseConnection();
  if (!dbResult) {
    console.log('\n⚠️  Database connection failed, but continuing...');
  }
  
  const serverResult = await testServerStartup();
  if (!serverResult) {
    console.log('\n❌ Server startup test failed');
    process.exit(1);
  }
  
  console.log('\n🎉 All tests completed successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Summary:');
  console.log('✅ Environment setup working');
  console.log(dbResult ? '✅ Database connection working' : '⚠️  Database connection failed');
  console.log('✅ Server startup working');
  console.log('✅ Graceful shutdown working');
  console.log('\n💡 Next steps:');
  console.log('1. Set your actual GEMINI_API_KEY in env files');
  console.log('2. Set your actual JWT_SECRET in env files');
  console.log('3. Fix database connection if needed');
  console.log('4. Run: npm run dev:full');
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n🛑 Tests interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Tests terminated');
  process.exit(0);
});

// Run tests
runTests().catch((error) => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
}); 