# Setup MySQL Database untuk MoneyWise

## Langkah 1: Install MySQL (jika belum ada)

### Di Windows:
1. Download MySQL dari https://dev.mysql.com/downloads/installer/
2. Install dengan MySQL Installer
3. Pilih "Developer Default" setup
4. Set password untuk root user

### Di Mac:
```bash
# Menggunakan Homebrew
brew install mysql
brew services start mysql

# Set password untuk root
mysql_secure_installation
```

### Di Linux:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation

# CentOS/RHEL
sudo yum install mysql-server
sudo systemctl start mysqld
sudo mysql_secure_installation
```

## Langkah 2: Buat Database dan User

Masuk ke MySQL:
```bash
mysql -u root -p
```

Buat database dan user:
```sql
-- Buat database
CREATE DATABASE moneywise;

-- Buat user khusus (opsional, untuk keamanan)
CREATE USER 'moneywise_user'@'localhost' IDENTIFIED BY 'password123';

-- Berikan permission
GRANT ALL PRIVILEGES ON moneywise.* TO 'moneywise_user'@'localhost';
FLUSH PRIVILEGES;

-- Lihat database yang sudah dibuat
SHOW DATABASES;

-- Keluar dari MySQL
EXIT;
```

## Langkah 3: Update File .env

Sesuaikan dengan konfigurasi MySQL Anda:

```env
# Jika menggunakan root user
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password_anda
DB_NAME=moneywise
DATABASE_URL=mysql://root:password_anda@localhost:3306/moneywise

# Jika menggunakan user khusus
DB_HOST=localhost
DB_PORT=3306
DB_USER=moneywise_user
DB_PASSWORD=password123
DB_NAME=moneywise
DATABASE_URL=mysql://moneywise_user:password123@localhost:3306/moneywise
```

## Langkah 4: Test Koneksi Database

Jalankan script test koneksi:
```bash
npm run test:db
```

## Langkah 5: Jalankan Migration

Untuk membuat tabel-tabel yang diperlukan:
```bash
npm run db:push
```

## Troubleshooting

### Error: "Access denied for user"
- Pastikan username dan password benar
- Pastikan user memiliki permission ke database

### Error: "Can't connect to MySQL server"
- Pastikan MySQL service berjalan
- Pastikan port 3306 tidak diblokir

### Error: "Unknown database"
- Pastikan database 'moneywise' sudah dibuat
- Jalankan CREATE DATABASE moneywise;

## Konfigurasi untuk Hostinger

Jika deploy ke Hostinger:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=nama_user_hostinger
DB_PASSWORD=password_database_hostinger
DB_NAME=nama_database_hostinger
DATABASE_URL=mysql://nama_user_hostinger:password_database_hostinger@localhost:3306/nama_database_hostinger
```

## Monitoring Database

Untuk melihat tabel yang dibuat:
```sql
USE moneywise;
SHOW TABLES;
DESCRIBE users;
DESCRIBE transactions;
```