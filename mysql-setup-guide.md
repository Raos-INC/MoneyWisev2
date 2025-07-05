# Panduan Setup MySQL untuk MoneyWise

## Cara Koneksi Database MySQL

### 1. Pilihan Database untuk Development

#### Option A: Menggunakan MySQL Lokal
Jika Anda ingin menggunakan MySQL di komputer lokal:

```bash
# Install MySQL (pilih sesuai OS)
# Windows: Download dari mysql.com
# Mac: brew install mysql
# Linux: sudo apt install mysql-server

# Start MySQL service
# Windows: Net start mysql
# Mac: brew services start mysql
# Linux: sudo systemctl start mysql

# Login dan buat database
mysql -u root -p
CREATE DATABASE moneywise;
EXIT;
```

#### Option B: Menggunakan Database Cloud (Recommended)
Untuk kemudahan, gunakan layanan database cloud:

**PlanetScale (Gratis)**:
1. Daftar di https://planetscale.com
2. Buat database baru
3. Salin connection string

**Railway (Gratis)**:
1. Daftar di https://railway.app
2. Buat MySQL database
3. Salin connection string

**Aiven (Gratis)**:
1. Daftar di https://aiven.io
2. Buat MySQL service
3. Salin connection string

### 2. Update File .env

Sesuaikan dengan database yang Anda pilih:

```env
# Untuk MySQL Lokal
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password_anda
DB_NAME=moneywise
DATABASE_URL=mysql://root:password_anda@localhost:3306/moneywise

# Untuk Database Cloud (contoh PlanetScale)
DATABASE_URL=mysql://username:password@host:3306/database_name?ssl={"rejectUnauthorized":true}

# Environment lainnya
NODE_ENV=development
VITE_NODE_ENV=development
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Test Koneksi Database

Jalankan script test:
```bash
node test-db-connection.js
```

### 4. Buat Tabel Database

Setelah koneksi berhasil, buat tabel:
```bash
npm run db:push
```

### 5. Jalankan Aplikasi

```bash
npm run dev
```

## Troubleshooting

### Error: "ECONNREFUSED 127.0.0.1:3306"
- MySQL server tidak berjalan
- Jalankan: `brew services start mysql` (Mac) atau `sudo systemctl start mysql` (Linux)

### Error: "Access denied for user"
- Username atau password salah
- Cek file .env dan pastikan credentials benar

### Error: "Unknown database"
- Database belum dibuat
- Buat database: `CREATE DATABASE moneywise;`

### Error: "Table doesn't exist"
- Tabel belum dibuat
- Jalankan: `npm run db:push`

## Recommendation untuk Pemula

Saya rekomendasikan menggunakan **PlanetScale** karena:
- Gratis dan mudah setup
- Tidak perlu install MySQL di komputer
- Sudah include SSL dan backup otomatis
- Cocok untuk development dan production

Langkah setup PlanetScale:
1. Buka https://planetscale.com
2. Daftar akun gratis
3. Buat database baru
4. Salin connection string
5. Masukkan ke file .env
6. Jalankan `npm run db:push`

Apakah Anda ingin saya buatkan account PlanetScale atau ingin setup MySQL lokal?