import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');

console.log('🚀 Railway Deployment Script for MoneyWise');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Check if we're in the right directory
if (!fs.existsSync(path.join(rootDir, 'package.json'))) {
  console.error('❌ package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check if .env exists
if (!fs.existsSync(path.join(rootDir, '.env'))) {
  console.log('⚠️  .env file not found. Creating from env.production...');
  try {
    fs.copyFileSync(path.join(rootDir, 'env.production'), path.join(rootDir, '.env'));
    console.log('✅ Created .env from env.production');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    process.exit(1);
  }
}

// Check if Railway CLI is installed
console.log('\n📋 Pre-deployment checks:');
console.log('1. Checking Railway CLI...');

try {
  const { execSync } = await import('child_process');
  execSync('railway --version', { stdio: 'pipe' });
  console.log('✅ Railway CLI is installed');
} catch (error) {
  console.log('❌ Railway CLI not found. Installing...');
  try {
    const { execSync } = await import('child_process');
    execSync('npm install -g @railway/cli', { stdio: 'inherit' });
    console.log('✅ Railway CLI installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install Railway CLI:', installError.message);
    console.log('\n💡 Manual installation:');
    console.log('   npm install -g @railway/cli');
    process.exit(1);
  }
}

// Check if logged in to Railway
console.log('2. Checking Railway login...');
try {
  const { execSync } = await import('child_process');
  execSync('railway whoami', { stdio: 'pipe' });
  console.log('✅ Logged in to Railway');
} catch (error) {
  console.log('❌ Not logged in to Railway. Please login:');
  console.log('   railway login');
  process.exit(1);
}

// Build the application
console.log('\n🔨 Building application...');
try {
  const { execSync } = await import('child_process');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Deploy to Railway
console.log('\n🚀 Deploying to Railway...');
try {
  const { execSync } = await import('child_process');
  execSync('railway up', { stdio: 'inherit' });
  console.log('✅ Deployment completed successfully');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 Deployment completed!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 Next steps:');
console.log('1. Check your Railway dashboard for the deployment status');
console.log('2. Verify environment variables are set correctly');
console.log('3. Test the health endpoint: https://your-app.railway.app/health');
console.log('4. Update your frontend to use the new API URL');
console.log('\n💡 Environment variables to check in Railway:');
console.log('   - NODE_ENV=production');
console.log('   - DB_HOST=srv1982.hstgr.io');
console.log('   - DB_USER=u415928144_MOM');
console.log('   - DB_PASSWORD=Master10Of-07Money_05');
console.log('   - DB_NAME=u415928144_MoneyWise');
console.log('   - JWT_SECRET=your-secure-jwt-secret');
console.log('   - GEMINI_API_KEY=your-gemini-api-key');
console.log('   - CORS_ORIGIN=https://your-hostinger-domain.com'); 