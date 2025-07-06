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

function createDefaultEnvFile(mode) {
  const isDev = mode === 'dev' || mode === 'development';
  
  const defaultEnvContent = isDev ? 
    `# Development Environment Configuration
NODE_ENV=development
VITE_NODE_ENV=development

# Database Configuration untuk MySQL Hostinger (Development)
DB_HOST=srv1982.hstgr.io
DB_PORT=3306
DB_USER=u415928144_MOM
DB_PASSWORD=Master10Of-07Money_05
DB_NAME=u415928144_MoneyWise
DATABASE_URL=mysql://u415928144_MOM:Master10Of-07Money_05@srv1982.hstgr.io:3306/u415928144_MoneyWise

# Railway API URL (Development - akan di-override oleh Vite proxy)
VITE_API_URL=http://127.0.0.1:5000

# API Keys
GEMINI_API_KEY=AIzaSyAnkZNecHZ_om-VYX7TEhJl5PAXZnAlogo

# JWT Secret (Development)
JWT_SECRET=gS+qyXptsTPqHrLDRNlEhviDKpfGjadWC3qsl6dJoRA=

# Server Configuration
PORT=5000
HOST=127.0.0.1

# CORS Configuration (Development)
CORS_ORIGIN=http://localhost:3000` :
    `# Production Environment Configuration
NODE_ENV=production
VITE_NODE_ENV=production

# Database Configuration untuk MySQL Hostinger (Production)
DB_HOST=srv1982.hstgr.io
DB_PORT=3306
DB_USER=u415928144_MOM
DB_PASSWORD=Master10Of-07Money_05
DB_NAME=u415928144_MoneyWise
DATABASE_URL=mysql://u415928144_MOM:Master10Of-07Money_05@srv1982.hstgr.io:3306/u415928144_MoneyWise

# Railway API URL (Production)
VITE_API_URL=https://moneywise-production-d344.up.railway.app

# API Keys
GEMINI_API_KEY=AIzaSyAnkZNecHZ_om-VYX7TEhJl5PAXZnAlogo

# JWT Secret (Production - generate random string)
JWT_SECRET=Pyt+MdRQs6BCbO+BnhDk3hlilJbdLjJhXOb4X2HyBFg=

# Server Configuration
PORT=8080
HOST=0.0.0.0

# CORS Configuration (Production)
CORS_ORIGIN=https://moneywise.fun`;

  const targetPath = path.join(rootDir, '.env');
  
  try {
    fs.writeFileSync(targetPath, defaultEnvContent);
    console.log(`✅ Created default .env file for ${mode} mode`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating default .env file: ${error.message}`);
    return false;
  }
}

function copyEnvFile(sourceFile, targetFile) {
  const sourcePath = path.join(rootDir, sourceFile);
  const targetPath = path.join(rootDir, targetFile);
  
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source file ${sourceFile} not found!`);
    return false;
  }
  
  try {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Copied ${sourceFile} to ${targetFile}`);
    return true;
  } catch (error) {
    console.error(`❌ Error copying file: ${error.message}`);
    return false;
  }
}

function updateClientEnv(apiUrl) {
  const clientEnvPath = path.join(rootDir, 'client', '.env');
  const clientEnvContent = `VITE_API_URL=${apiUrl}\n`;
  
  try {
    // Ensure client directory exists
    const clientDir = path.dirname(clientEnvPath);
    if (!fs.existsSync(clientDir)) {
      fs.mkdirSync(clientDir, { recursive: true });
    }
    
    fs.writeFileSync(clientEnvPath, clientEnvContent);
    console.log(`✅ Updated client/.env with API URL: ${apiUrl}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating client/.env: ${error.message}`);
    return false;
  }
}

function validateEnvFile(envPath) {
  try {
    if (!fs.existsSync(envPath)) {
      console.log('⚠️  .env file not found at:', envPath);
      return false;
    }
    
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
    
    let allValid = true;
    requiredVars.forEach(varName => {
      const value = envVars[varName];
      if (!value || value === '') {
        console.log(`⚠️  ${varName}: NOT SET`);
        allValid = false;
      } else if (varName.includes('PASSWORD') || varName.includes('SECRET') || varName.includes('KEY')) {
        console.log(`✅ ${varName}: SET (${value.length} chars)`);
      } else {
        console.log(`✅ ${varName}: ${value}`);
      }
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return allValid;
    
  } catch (error) {
    console.error(`❌ Error reading environment file: ${error.message}`);
    return false;
  }
}

const mode = process.argv[2];

if (!mode || !['dev', 'development', 'prod', 'production'].includes(mode)) {
  console.log('🚀 MoneyWise Environment Setup');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/setup-env.js dev     - Setup development environment');
  console.log('  node scripts/setup-env.js prod    - Setup production environment');
  console.log('');
  console.log('This will:');
  console.log('  1. Copy the appropriate env file to .env (or create default if not found)');
  console.log('     (priority: .env.dev/.env.prod > env.development/env.production)');
  console.log('  2. Update client/.env with correct API URL');
  console.log('  3. Validate environment variables');
  console.log('  4. Show next steps');
  console.log('');
  process.exit(0);
}

console.log('🔄 Setting up MoneyWise environment...\n');

if (mode === 'dev' || mode === 'development') {
  console.log('📝 Setting up DEVELOPMENT environment...');
  
  // Try to find existing env file first
  let devEnvFile = findEnvFile('dev');
  let success = false;
  
  if (devEnvFile) {
    console.log(`📁 Found existing env file: ${devEnvFile}`);
    success = copyEnvFile(devEnvFile, '.env');
  } else {
    console.log('⚠️  No existing development env file found');
    console.log('💡 Creating default development .env file...');
    success = createDefaultEnvFile('dev');
  }
  
  if (success) {
    updateClientEnv('http://localhost:5000');
    validateEnvFile(path.join(rootDir, '.env'));
    
    console.log('\n✅ Development environment setup complete!');
    console.log('\n📋 Next steps:');
    console.log('  1. Install dependencies: npm install');
    console.log('  2. Test database connection: npm run test:db');
    console.log('  3. Setup database tables: npm run db:push');
    console.log('  4. Start development server: npm run dev:full');
    console.log('\n🌐 Your app will be available at:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend API: http://localhost:5000');
  } else {
    console.error('\n❌ Failed to setup development environment!');
    process.exit(1);
  }
  
} else if (mode === 'prod' || mode === 'production') {
  console.log('📝 Setting up PRODUCTION environment...');
  
  // Try to find existing env file first
  let prodEnvFile = findEnvFile('prod');
  let success = false;
  
  if (prodEnvFile) {
    console.log(`📁 Found existing env file: ${prodEnvFile}`);
    success = copyEnvFile(prodEnvFile, '.env');
  } else {
    console.log('⚠️  No existing production env file found');
    console.log('💡 Creating default production .env file...');
    success = createDefaultEnvFile('prod');
  }
  
  if (success) {
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
  } else {
    console.error('\n❌ Failed to setup production environment!');
    process.exit(1);
  }
}

console.log('\n🎉 Environment setup complete!'); 