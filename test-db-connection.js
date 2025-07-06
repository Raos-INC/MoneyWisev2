import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  console.log('🔍 Testing MySQL database connection...');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'moneywise',
    connectTimeout: 10000, // 10 seconds timeout
    acquireTimeout: 10000,
    timeout: 10000,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  };

  console.log('📋 Configuration:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   Password: ${config.password ? '[HIDDEN]' : '[EMPTY]'}`);
  console.log(`   SSL: ${config.ssl ? 'Enabled' : 'Disabled'}`);
  
  try {
    // Test connection
    console.log('\n🔄 Attempting to connect...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Database connection successful!');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', rows);
    
    // Show databases
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📊 Available databases:', databases.map(db => db.Database));
    
    // Check if our database exists
    const [dbExists] = await connection.execute(
      'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
      [config.database]
    );
    
    if (dbExists.length > 0) {
      console.log(`✅ Database '${config.database}' exists`);
      
      // Switch to our database
      await connection.execute(`USE ${config.database}`);
      
      // Show tables
      const [tables] = await connection.execute('SHOW TABLES');
      console.log('📋 Tables in database:', tables.map(table => Object.values(table)[0]));
      
      // Test user permissions
      try {
        const [userInfo] = await connection.execute('SELECT USER(), CURRENT_USER()');
        console.log('👤 Current user info:', userInfo[0]);
      } catch (permError) {
        console.log('⚠️  Could not check user permissions:', permError.message);
      }
    } else {
      console.log(`❌ Database '${config.database}' does not exist`);
      console.log('💡 Please create the database first:');
      console.log(`   CREATE DATABASE ${config.database};`);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Specific error handling for common issues
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 Access Denied Error - Possible solutions:');
      console.log('1. Check username and password in .env file');
      console.log('2. Verify user has permission to access database from your IP');
      console.log('3. Contact Hostinger support to whitelist your IP address');
      console.log('4. Check if database user exists and has proper permissions');
      console.log('\n📞 Hostinger Database Access:');
      console.log('- Go to Hostinger cPanel → Databases → MySQL Databases');
      console.log('- Check if user exists and has proper permissions');
      console.log('- You may need to add your IP to allowed hosts');
      
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Connection Refused - Possible solutions:');
      console.log('1. Check if MySQL server is running on Hostinger');
      console.log('2. Verify host and port are correct');
      console.log('3. Check if database service is active');
      
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n🔧 Connection Timeout - Possible solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Try again later (server might be busy)');
      console.log('3. Contact Hostinger support');
      
    } else {
      console.log('\n🔧 General troubleshooting steps:');
      console.log('1. Make sure MySQL server is running');
      console.log('2. Check your .env file configuration');
      console.log('3. Verify username and password are correct');
      console.log('4. Make sure database exists');
      console.log('5. Check if user has permission to access database');
      console.log('6. Contact Hostinger support for database access issues');
    }
    
    console.log('\n📋 Environment Check:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`   DB_HOST: ${process.env.DB_HOST || 'not set'}`);
    console.log(`   DB_USER: ${process.env.DB_USER || 'not set'}`);
    console.log(`   DB_NAME: ${process.env.DB_NAME || 'not set'}`);
    
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();