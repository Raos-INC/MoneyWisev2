import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// MySQL connection configuration
const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'moneywise',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000, // 60 seconds
  acquireTimeout: 60000, // 60 seconds
  timeout: 60000, // 60 seconds
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  // Additional options for better connection handling
  charset: 'utf8mb4',
  timezone: 'UTC',
  dateStrings: true,
  supportBigNumbers: true,
  bigNumberStrings: true
};

// Create pool and db instances
let pool: mysql.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

// Initialize database connection
export async function initializeDatabase() {
  // Check if we should skip database connection
  if (process.env.SKIP_DB === 'true') {
    console.log('⚠️  Database connection skipped (SKIP_DB=true)');
    console.log('   Database features will not work, but server will start');
    return;
  }

  try {
    console.log('🔌 Connecting to database...');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   User: ${process.env.DB_USER}`);
    
    pool = mysql.createPool(connectionConfig);
    db = drizzle(pool, { schema, mode: 'default' });
    
    // Test connection with timeout
    const connection = await Promise.race([
      pool.getConnection(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 30000)
      )
    ]);
    
    // Release the test connection
    connection.release();
    
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', (error as Error).message);
    
    // Provide specific error guidance
    if ((error as any).code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 Access Denied Error - Possible solutions:');
      console.log('1. Check username and password in .env file');
      console.log('2. Verify user has permission to access database from your IP');
      console.log('3. Contact Hostinger support to whitelist your IP address');
      console.log('4. Check if database user exists and has proper permissions');
      console.log('\n📞 Hostinger Database Access:');
      console.log('- Go to Hostinger cPanel → Databases → MySQL Databases');
      console.log('- Check if user exists and has proper permissions');
      console.log('- You may need to add your IP to allowed hosts');
    }
    
    console.log('\n💡 You can start development without database using: npm run dev:no-db');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Starting server without database connection...');
      console.log('   Database features will not work, but server will start');
      pool = null;
      db = null;
    } else {
      console.error('❌ Cannot start production server without database');
      process.exit(1);
    }
  }
}

// Export pool and db
export { pool, db };