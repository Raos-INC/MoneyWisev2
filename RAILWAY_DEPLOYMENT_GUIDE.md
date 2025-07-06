# 🚀 Railway Deployment Guide untuk MoneyWise

## 📋 Overview

MoneyWise menggunakan arsitektur multi-platform:
- **Frontend**: React + Vite (Hostinger)
- **Backend**: Node.js + Express (Railway)
- **Database**: MySQL (Hostinger)

## 🎯 Mengapa Railway untuk Backend?

✅ **Keuntungan Railway:**
- Auto-scaling dan load balancing
- Zero-downtime deployments
- Built-in monitoring dan logging
- Easy environment variable management
- Free tier yang generous
- Git integration

✅ **Keuntungan Hostinger untuk Frontend & DB:**
- Cost-effective untuk static hosting
- MySQL database yang reliable
- CDN global untuk frontend
- Easy domain management

## 🛠️ Setup Railway

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login ke Railway
```bash
railway login
# atau
npm run railway:login
```

### 3. Initialize Railway Project
```bash
railway init
```

## 🔧 Environment Variables di Railway

Set environment variables berikut di Railway dashboard:

### Database Configuration
```
NODE_ENV=production
DB_HOST=srv1982.hstgr.io
DB_PORT=3306
DB_USER=u415928144_MOM
DB_PASSWORD=Master10Of-07Money_05
DB_NAME=u415928144_MoneyWise
DATABASE_URL=mysql://u415928144_MOM:Master10Of-07Money_05@srv1982.hstgr.io:3306/u415928144_MoneyWise
```

### Security & API Keys
```
JWT_SECRET=your-super-secure-jwt-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
```

### CORS & URLs
```
CORS_ORIGIN=https://your-hostinger-domain.com
VITE_API_URL=https://your-railway-app.railway.app
```

### Server Configuration
```
PORT=8080
HOST=0.0.0.0
```

## 🚀 Deployment Process

### Method 1: Automated Script
```bash
npm run deploy:railway
```

### Method 2: Manual Steps
```bash
# 1. Build application
npm run build

# 2. Deploy to Railway
railway up

# 3. Check status
railway status

# 4. View logs
railway logs
```

### Method 3: Git Integration
```bash
# Push to your Git repository
git push origin main

# Railway will auto-deploy from Git
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint
```
GET https://your-app.railway.app/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "MoneyWise API",
  "environment": "production",
  "database": "Connected"
}
```

### Railway Dashboard
- Monitor CPU, memory, and network usage
- View real-time logs
- Check deployment status
- Set up alerts

## 🔄 Update Frontend Configuration

Setelah backend berhasil deploy di Railway, update frontend:

### 1. Update API URL di Hostinger
```javascript
// Di file konfigurasi frontend
const API_URL = 'https://your-railway-app.railway.app';
```

### 2. Update CORS di Railway
```
CORS_ORIGIN=https://your-hostinger-domain.com
```

## 🛡️ Security Best Practices

### 1. Environment Variables
- ✅ Gunakan Railway's built-in environment variable management
- ✅ Jangan commit secrets ke Git
- ✅ Rotate JWT secrets regularly

### 2. Database Security
- ✅ Gunakan SSL untuk database connection
- ✅ Restrict database access by IP
- ✅ Regular database backups

### 3. API Security
- ✅ Implement rate limiting
- ✅ Validate all inputs
- ✅ Use HTTPS only

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check database connection
npm run test:db

# Verify environment variables
railway variables
```

#### 2. Build Failed
```bash
# Check TypeScript errors
npm run check

# Build locally first
npm run build
```

#### 3. CORS Issues
```bash
# Check CORS configuration
curl -H "Origin: https://your-domain.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://your-railway-app.railway.app/health
```

### Useful Commands
```bash
# View logs
npm run railway:logs

# Check status
npm run railway:status

# Redeploy
npm run railway:up

# Connect to Railway shell
railway shell
```

## 📈 Scaling

### Auto-scaling
Railway automatically scales based on:
- CPU usage
- Memory usage
- Request volume

### Manual Scaling
```bash
# Scale to specific number of replicas
railway scale 2
```

## 💰 Cost Optimization

### Free Tier Limits
- 500 hours/month
- 512MB RAM
- Shared CPU

### Pro Tier Benefits
- Unlimited hours
- Up to 8GB RAM
- Dedicated CPU
- Custom domains

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: railway/deploy@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
```

## 📞 Support

### Railway Support
- Documentation: https://docs.railway.app
- Discord: https://discord.gg/railway
- Email: support@railway.app

### Project-specific Issues
- Check logs: `railway logs`
- Health check: `/health` endpoint
- Database test: `npm run test:db`

---

## 🎉 Success Checklist

- [ ] Railway CLI installed and logged in
- [ ] Environment variables configured
- [ ] Application builds successfully
- [ ] Database connection working
- [ ] Health check endpoint responding
- [ ] Frontend updated with new API URL
- [ ] CORS configured correctly
- [ ] SSL certificate active
- [ ] Monitoring set up
- [ ] Backup strategy in place

**Selamat! MoneyWise Anda sekarang berjalan di Railway! 🚀** 