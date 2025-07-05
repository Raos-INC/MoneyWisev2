# Panduan Deploy MoneyWise ke Hostinger

## Persiapan Hosting

### 1. Konfigurasi Database MySQL di Hostinger
```bash
# Di cPanel Hostinger, buat database MySQL:
# - Database name: moneywise
# - Username: moneywise_user
# - Password: [password yang kuat]
```

### 2. Environment Variables untuk Production
Buat file `.env.production` dengan konfigurasi berikut:
```env
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_USER=moneywise_user
DB_PASSWORD=[password_database]
DB_NAME=moneywise
GEMINI_API_KEY=[your_gemini_api_key]
```

## Langkah Deploy

### 1. Build Application
```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Build server
npm run build:server
```

### 2. Upload Files ke Hostinger
Upload file-file berikut ke public_html:
- `/dist/` (frontend build)
- `/server/` (server files)
- `/.htaccess` (rewrite rules)
- `/package.json`
- `/package-lock.json`

### 3. Setup Database
Jalankan migrations untuk membuat tabel:
```bash
npm run db:push
```

### 4. Konfigurasi Server di Hostinger
Di Node.js App Setup di cPanel:
- Startup file: `server/index.js`
- Application URL: domain Anda
- Node.js version: 18 atau lebih tinggi

### 5. Environment Variables di Hostinger
Tambahkan environment variables di Node.js App Setup:
```
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_USER=moneywise_user
DB_PASSWORD=[password_database]
DB_NAME=moneywise
GEMINI_API_KEY=[your_gemini_api_key]
```

## File yang Diperlukan untuk Production

### 1. package.json - Update scripts
```json
{
  "scripts": {
    "start": "node server/index.js",
    "build": "vite build",
    "build:server": "tsc server/index.ts --outDir dist-server",
    "db:push": "drizzle-kit push:mysql"
  }
}
```

### 2. Server Production Config
Update `server/index.ts` untuk production:
```typescript
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Testing Production Build

### 1. Test Locally
```bash
npm run build
npm run start
```

### 2. Test Database Connection
```bash
npm run db:push
```

## Performance Optimizations

### 1. Enable Compression
- .htaccess sudah dikonfigurasi untuk compression
- Static assets akan di-cache selama 1 tahun

### 2. Database Optimizations
- Connection pooling sudah dikonfigurasi
- Indexes pada tabel transactions dan categories

### 3. Frontend Optimizations
- Code splitting dengan dynamic imports
- Asset compression dan minification
- Service worker untuk caching (opsional)

## Monitoring & Troubleshooting

### 1. Log Files
- Check Node.js error logs di cPanel
- Monitor database connection errors

### 2. Common Issues
- Pastikan Node.js version kompatibel (18+)
- Verify database credentials
- Check environment variables

### 3. Performance Monitoring
- Monitor response times
- Database query performance
- Memory usage

## Security Checklist

### 1. Database Security
- ✅ Strong database password
- ✅ Limited database user permissions
- ✅ SSL connection ke database

### 2. Application Security
- ✅ Environment variables tidak di-commit
- ✅ HTTPS enforced
- ✅ Security headers di .htaccess
- ✅ Input validation dengan Zod

### 3. API Security
- ✅ Rate limiting (bisa ditambahkan)
- ✅ CORS configuration
- ✅ Authentication middleware

## Maintenance

### 1. Regular Updates
- Update dependencies secara berkala
- Monitor security vulnerabilities
- Backup database rutin

### 2. Performance Monitoring
- Monitor server resources
- Database query optimization
- Frontend bundle size

### 3. User Support
- Error logging dan monitoring
- User feedback collection
- Feature usage analytics