# Windows Development Setup Guide

## 🪟 Windows-Specific Setup untuk MoneyWise

### Prerequisites untuk Windows

1. **Node.js 18+**
   ```bash
   # Download dari https://nodejs.org/
   # Atau menggunakan Chocolatey:
   choco install nodejs
   ```

2. **Git**
   ```bash
   # Download dari https://git-scm.com/
   # Atau menggunakan Chocolatey:
   choco install git
   ```

3. **Visual Studio Code (Recommended)**
   ```bash
   # Download dari https://code.visualstudio.com/
   # Atau menggunakan Chocolatey:
   choco install vscode
   ```

### Setup Project di Windows

#### 1. Clone Repository
```bash
# Buka Command Prompt atau PowerShell sebagai Administrator
git clone <your-repo-url>
cd MoneyWise
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Setup Environment
```bash
# Setup untuk development
npm run env:dev

# Atau manual:
# Copy env.development ke .env
copy env.development .env
```

#### 4. Test Database Connection
```bash
npm run test:db
```

#### 5. Setup Database Tables
```bash
npm run db:push
```

#### 6. Start Development Server
```bash
npm run dev
```

### Windows-Specific Commands

#### Port Management
```bash
# Cek port yang sedang digunakan
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Kill process berdasarkan PID
taskkill /PID <PID> /F
```

#### Environment Variables
```bash
# Set environment variable temporary
set NODE_ENV=development

# Atau gunakan cross-env (sudah diinstall)
npx cross-env NODE_ENV=development npm run dev
```

#### File Permissions
Jika ada masalah permission:
```bash
# Run Command Prompt sebagai Administrator
# Atau gunakan PowerShell dengan Execution Policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Troubleshooting Windows

#### 1. "NODE_ENV is not recognized"
**Solution**: Gunakan `cross-env` atau set environment variable manual
```bash
# Gunakan script yang sudah disediakan
npm run dev

# Atau manual
set NODE_ENV=development && npm run dev
```

#### 2. "Port already in use"
**Solution**: Kill process yang menggunakan port
```bash
# Cari PID
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

#### 3. "Permission denied"
**Solution**: Run sebagai Administrator atau fix permissions
```bash
# Run Command Prompt sebagai Administrator
# Atau gunakan PowerShell dengan proper permissions
```

#### 4. "Path too long"
**Solution**: Enable long paths di Windows
```bash
# Run di Command Prompt sebagai Administrator
fsutil behavior set SymlinkEvaluation L2L:1 R2R:1 L2R:1 R2L:1
```

#### 5. "Git line endings"
**Solution**: Configure Git untuk Windows
```bash
git config --global core.autocrlf true
git config --global core.eol lf
```

### Development Workflow di Windows

#### 1. Setup Awal
```bash
# Clone dan setup
git clone <repo-url>
cd MoneyWise
npm install
npm run env:dev
npm run test:db
npm run db:push
```

#### 2. Development Harian
```bash
# Start development
npm run dev

# Atau start terpisah
npm run dev:backend   # Terminal 1
npm run dev:frontend  # Terminal 2
```

#### 3. Testing
```bash
# Test database
npm run test:db

# Type check
npm run check

# Build test
npm run build
```

#### 4. Deployment
```bash
# Setup production environment
npm run env:prod

# Build untuk production
npm run build

# Commit dan push
git add .
git commit -m "Update for production"
git push
```

### VS Code Extensions (Recommended)

1. **ES7+ React/Redux/React-Native snippets**
2. **Prettier - Code formatter**
3. **ESLint**
4. **TypeScript Importer**
5. **Auto Rename Tag**
6. **Bracket Pair Colorizer**
7. **GitLens**
8. **Thunder Client** (untuk test API)

### Windows Performance Tips

1. **Disable Windows Defender** untuk folder project (temporary)
2. **Use WSL2** untuk development (optional)
3. **Increase Node.js memory limit**
   ```bash
   set NODE_OPTIONS=--max-old-space-size=4096
   ```

### Common Windows Commands

```bash
# File operations
copy source dest
move source dest
del filename
dir

# Process management
tasklist
taskkill /PID <PID> /F

# Network
ipconfig
netstat -ano

# Environment
set
echo %NODE_ENV%
```

### Backup dan Restore

#### Backup Environment
```bash
# Backup current .env
copy .env .env.backup

# Restore environment
copy .env.backup .env
```

#### Backup Database (jika perlu)
```bash
# Export database (jika ada access)
mysqldump -h srv1982.hstgr.io -u u415928144_MOM -p u415928144_MoneyWise > backup.sql

# Import database
mysql -h srv1982.hstgr.io -u u415928144_MOM -p u415928144_MoneyWise < backup.sql
```

### Security Considerations

1. **Jangan commit .env files**
2. **Gunakan environment variables**
3. **Keep dependencies updated**
4. **Use HTTPS in production**
5. **Regular backups**

### Support

Jika ada masalah:
1. Check troubleshooting section di README.md
2. Run `npm run env:help` untuk bantuan environment
3. Test database connection dengan `npm run test:db`
4. Check Windows event logs untuk error details 