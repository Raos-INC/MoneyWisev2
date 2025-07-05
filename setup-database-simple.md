# Setup Database MySQL - Cara Mudah

## Pilihan Tercepat: Database Online (Recommended)

### 1. Menggunakan Turso (SQLite Cloud) - Gratis
Cara termudah untuk development:

```bash
# Install Turso CLI
npm install -g @libsql/client

# Atau langsung pakai connection string
# Update .env dengan:
DATABASE_URL=libsql://database-name.turso.io
```

### 2. Menggunakan Railway - Gratis
1. Buka https://railway.app
2. Sign up dengan GitHub
3. Klik "New Project" → "Database" → "MySQL"
4. Salin connection string
5. Update .env

### 3. Menggunakan PlanetScale - Gratis
1. Buka https://planetscale.com
2. Sign up gratis
3. Buat database baru
4. Salin connection string
5. Update .env

## Konfigurasi .env

Pilih salah satu:

```env
# Option 1: Railway
DATABASE_URL=mysql://root:password@containers-us-west-1.railway.app:7777/railway

# Option 2: PlanetScale
DATABASE_URL=mysql://username:password@aws.connect.psdb.cloud/database?ssl={"rejectUnauthorized":true}

# Option 3: MySQL Lokal (jika sudah install)
DATABASE_URL=mysql://root:password@localhost:3306/moneywise

# Environment lainnya
NODE_ENV=development
VITE_NODE_ENV=development
GEMINI_API_KEY=your-gemini-api-key
```

## Setelah Setup Database

1. **Update file .env** dengan connection string yang benar
2. **Buat tabel database**:
   ```bash
   npm run db:push
   ```
3. **Jalankan aplikasi**:
   ```bash
   npm run dev
   ```

## Test Koneksi

Untuk test apakah database sudah terhubung:
```bash
node test-db-connection.js
```

## Yang Perlu Dilakukan Sekarang

1. **Pilih database provider** (saya rekomendasikan Railway atau PlanetScale)
2. **Daftar akun gratis** di salah satu platform
3. **Buat database MySQL**
4. **Salin connection string**
5. **Update file .env**
6. **Jalankan `npm run db:push`**

Apakah Anda ingin saya bantu dengan salah satu pilihan di atas?