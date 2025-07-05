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
    database: process.env.DB_NAME || 'moneywise'
  };

  console.log('📋 Configuration:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   Password: ${config.password ? '[HIDDEN]' : '[EMPTY]'}`);
  
  try {
    // Test connection
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
    } else {
      console.log(`❌ Database '${config.database}' does not exist`);
      console.log('💡 Please create the database first:');
      console.log(`   CREATE DATABASE ${config.database};`);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure MySQL server is running');
    console.log('2. Check your .env file configuration');
    console.log('3. Verify username and password are correct');
    console.log('4. Make sure database exists');
    console.log('5. Check if user has permission to access database');
    
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();