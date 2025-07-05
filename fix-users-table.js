import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

async function fixUsersTable() {
  console.log('🔄 Fixing users table structure...');
  
  try {
    const connection = await mysql.createConnection(config);
    
    // First, check current table structure
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('📋 Current columns:', columns.map(col => col.Field));
    
    // Temporarily disable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop dependent tables first
    const tablesToDrop = ['ai_insights', 'reports', 'savings_goals', 'budgets', 'transactions', 'categories'];
    for (const table of tablesToDrop) {
      await connection.execute(`DROP TABLE IF EXISTS ${table}`);
      console.log(`🗑️ Dropped ${table} table`);
    }
    
    // Drop and recreate users table with correct structure
    await connection.execute('DROP TABLE IF EXISTS users');
    console.log('🗑️ Dropped old users table');
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    // Create users table with all required columns
    await connection.execute(`
      CREATE TABLE users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created new users table with password column');
    
    // Recreate all other tables
    await connection.execute(`
      CREATE TABLE categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        color VARCHAR(7) DEFAULT '#3B82F6',
        icon VARCHAR(50) DEFAULT 'Wallet',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Recreated categories table');
    
    await connection.execute(`
      CREATE TABLE transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        category_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        type ENUM('income', 'expense') NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Recreated transactions table');
    
    await connection.execute(`
      CREATE TABLE budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        category_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        period VARCHAR(20) DEFAULT 'monthly',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Recreated budgets table');
    
    await connection.execute(`
      CREATE TABLE savings_goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        target_amount DECIMAL(10,2) NOT NULL,
        current_amount DECIMAL(10,2) DEFAULT 0,
        target_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Recreated savings_goals table');
    
    await connection.execute(`
      CREATE TABLE ai_insights (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
        actionable BOOLEAN DEFAULT FALSE,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Recreated ai_insights table');
    
    await connection.execute(`
      CREATE TABLE reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Recreated reports table');
    
    // Verify the new structure
    const [newColumns] = await connection.execute('DESCRIBE users');
    console.log('📋 New users columns:', newColumns.map(col => col.Field));
    
    // Show all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 All tables:', tables.map(table => Object.values(table)[0]));
    
    await connection.end();
    console.log('✅ Users table fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing users table:', error.message);
    process.exit(1);
  }
}

fixUsersTable();