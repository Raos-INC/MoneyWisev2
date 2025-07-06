import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');

function findEnvFile(mode) {
  // Prioritize .env.dev and .env.prod
  const devNames = ['.env.dev', 'env.dev', '.env.development', 'env.development'];
  const prodNames = ['.env.prod', 'env.prod', '.env.production', 'env.production'];
  const names = mode === 'dev' ? devNames : prodNames;
  for (const name of names) {
    const filePath = path.join(rootDir, name);
    if (fs.existsSync(filePath)) return name;
  }
  return null;
}

function copyEnvFile(sourceFile, targetFile) {
  const sourcePath = path.join(rootDir, sourceFile);
  const targetPath = path.join(rootDir, targetFile);
  
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source file ${sourceFile} not found!`);
    process.exit(1);
  }
  
  try {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Copied ${sourceFile} to ${targetFile}`);
  } catch (error) {
    console.error(`❌ Error copying file: ${error.message}`);
    process.exit(1);
  }
}

function updateClientEnv(apiUrl) {
  const clientEnvPath = path.join(rootDir, 'client', '.env');
  const clientEnvContent = `VITE_API_URL=${apiUrl}\n`;
  
  try {
    fs.writeFileSync(clientEnvPath, clientEnvContent);
    console.log(`✅ Updated client/.env with API URL: ${apiUrl}`);
  } catch (error) {
    console.error(`❌ Error updating client/.env: ${error.message}`);
  }
}

function validateEnvFile(envPath) {
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    console.log('\n📋 Environment Variables Check:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const requiredVars = [
      'NODE_ENV',
      'DB_HOST', 
      'DB_USER',
      'DB_PASSWORD',
      'DB_NAME',
      'JWT_SECRET',
      'GEMINI_API_KEY'
    ];
    
    const envVars = {};
    lines.forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    requiredVars.forEach(varName => {
      const value = envVars[varName];
      if (!value || value === '') {
        console.log(`⚠️  ${varName}: NOT SET`);
      } else if (varName.includes('PASSWORD') || varName.includes('SECRET') || varName.includes('KEY')) {
        console.log(`✅ ${varName}: SET (${value.length} chars)`);
      } else {
        console.log(`✅ ${varName}: ${value}`);
      }
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error(`❌ Error reading environment file: ${error.message}`);
  }
}

const mode = process.argv[2];

if (!mode || !['dev', 'development', 'prod', 'production'].includes(mode)) {
  console.log('🚀 MoneyWise Environment Setup');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/setup-env.js dev     - Setup development environment (.env.dev)');
  console.log('  node scripts/setup-env.js prod    - Setup production environment (.env.prod)');
  console.log('');
  console.log('This will:');
  console.log('  1. Copy the appropriate env file to .env');
  console.log('     (priority: .env.dev/.env.prod)');
  console.log('  2. Update client/.env with correct API URL');
  console.log('  3. Validate environment variables');
  console.log('  4. Show next steps');
  console.log('');
  process.exit(0);
}

console.log('🔄 Setting up MoneyWise environment...\n');

if (mode === 'dev' || mode === 'development') {
  console.log('📝 Setting up DEVELOPMENT environment...');
  const devEnvFile = findEnvFile('dev');
  if (!devEnvFile) {
    console.error('❌ No development environment file found!');
    console.log('💡 Expected files: .env.dev, env.dev, .env.development, env.development');
    process.exit(1);
  }
  copyEnvFile(devEnvFile, '.env');
  updateClientEnv('http://localhost:5000');
  validateEnvFile(path.join(rootDir, '.env'));
  
  console.log('\n✅ Development environment setup complete!');
  console.log('\n📋 Next steps:');
  console.log('  1. Install dependencies: npm install');
  console.log('  2. Test database connection: npm run test:db');
  console.log('  3. Setup database tables: npm run db:push');
  console.log('  4. Start development server: npm run dev');
  console.log('\n🌐 Your app will be available at:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   Backend API: http://localhost:5000');
  
} else if (mode === 'prod' || mode === 'production') {
  console.log('📝 Setting up PRODUCTION environment...');
  const prodEnvFile = findEnvFile('prod');
  if (!prodEnvFile) {
    console.error('❌ No production environment file found!');
    console.log('💡 Expected files: .env.prod, env.prod, .env.production, env.production');
    process.exit(1);
  }
  copyEnvFile(prodEnvFile, '.env');
  updateClientEnv('https://moneywise-production-d344.up.railway.app');
  validateEnvFile(path.join(rootDir, '.env'));
  
  console.log('\n✅ Production environment setup complete!');
  console.log('\n📋 Next steps:');
  console.log('  1. Build the application: npm run build');
  console.log('  2. Deploy to Railway: npm run deploy:railway');
  console.log('  3. Update environment variables in Railway dashboard');
  console.log('\n⚠️  Remember to:');
  console.log('  - Set proper JWT_SECRET in Railway');
  console.log('  - Add your GEMINI_API_KEY in Railway');
  console.log('  - Update CORS_ORIGIN with your Hostinger domain');
}

console.log('\n🎉 Environment setup complete!'); 