
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixDatabaseSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'moneywise'
  });

  try {
    console.log('Fixing database schema...');
    
    // Fix savings_goals table
    console.log('Fixing savings_goals table...');
    
    // Check if description column exists in savings_goals
    const [descColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'savings_goals' AND COLUMN_NAME = 'description'
    `, [process.env.DB_NAME || 'moneywise']);

    if (descColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE savings_goals 
        ADD COLUMN description TEXT AFTER name
      `);
      console.log('Added description column to savings_goals table');
    }

    // Check if icon column exists in savings_goals
    const [iconColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'savings_goals' AND COLUMN_NAME = 'icon'
    `, [process.env.DB_NAME || 'moneywise']);

    if (iconColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE savings_goals 
        ADD COLUMN icon VARCHAR(50) DEFAULT 'fas fa-piggy-bank' AFTER current_amount
      `);
      console.log('Added icon column to savings_goals table');
    }

    // Check if color column exists in savings_goals
    const [colorColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'savings_goals' AND COLUMN_NAME = 'color'
    `, [process.env.DB_NAME || 'moneywise']);

    if (colorColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE savings_goals 
        ADD COLUMN color VARCHAR(20) DEFAULT '#3B82F6' AFTER icon
      `);
      console.log('Added color column to savings_goals table');
    }

    // Check if is_completed column exists in savings_goals
    const [completedColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'savings_goals' AND COLUMN_NAME = 'is_completed'
    `, [process.env.DB_NAME || 'moneywise']);

    if (completedColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE savings_goals 
        ADD COLUMN is_completed BOOLEAN DEFAULT FALSE AFTER color
      `);
      console.log('Added is_completed column to savings_goals table');
    }

    // Fix reports table
    console.log('Fixing reports table...');
    
    // Check if title column exists and rename it to name
    const [reportTitleColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'reports' AND COLUMN_NAME = 'title'
    `, [process.env.DB_NAME || 'moneywise']);

    if (reportTitleColumns.length > 0) {
      await connection.execute(`
        ALTER TABLE reports 
        CHANGE COLUMN title name VARCHAR(200) NOT NULL
      `);
      console.log('Renamed title column to name in reports table');
    }

    // Check if name column exists, if not create it
    const [reportNameColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'reports' AND COLUMN_NAME = 'name'
    `, [process.env.DB_NAME || 'moneywise']);

    if (reportNameColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE reports 
        ADD COLUMN name VARCHAR(200) NOT NULL AFTER user_id
      `);
      console.log('Added name column to reports table');
    }

    // Add missing columns to reports table if they don't exist
    const [statusColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'reports' AND COLUMN_NAME = 'status'
    `, [process.env.DB_NAME || 'moneywise']);

    if (statusColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE reports 
        ADD COLUMN status VARCHAR(20) DEFAULT 'pending'
      `);
      console.log('Added status column to reports table');
    }

    // Check if period_start column exists in reports
    const [periodStartColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'reports' AND COLUMN_NAME = 'period_start'
    `, [process.env.DB_NAME || 'moneywise']);

    if (periodStartColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE reports 
        ADD COLUMN period_start DATE NOT NULL
      `);
      console.log('Added period_start column to reports table');
    }

    // Check if period_end column exists in reports
    const [periodEndColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'reports' AND COLUMN_NAME = 'period_end'
    `, [process.env.DB_NAME || 'moneywise']);

    if (periodEndColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE reports 
        ADD COLUMN period_end DATE NOT NULL
      `);
      console.log('Added period_end column to reports table');
    }

    // Check if metadata column exists in reports
    const [metadataColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'reports' AND COLUMN_NAME = 'metadata'
    `, [process.env.DB_NAME || 'moneywise']);

    if (metadataColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE reports 
        ADD COLUMN metadata JSON
      `);
      console.log('Added metadata column to reports table');
    }

    // Check if completed_at column exists in reports
    const [completedAtColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'reports' AND COLUMN_NAME = 'completed_at'
    `, [process.env.DB_NAME || 'moneywise']);

    if (completedAtColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE reports 
        ADD COLUMN completed_at TIMESTAMP NULL
      `);
      console.log('Added completed_at column to reports table');
    }

    // Drop format column if it exists in reports (not needed in schema)
    const [formatColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'reports' AND COLUMN_NAME = 'format'
    `, [process.env.DB_NAME || 'moneywise']);

    if (formatColumns.length > 0) {
      await connection.execute(`
        ALTER TABLE reports 
        DROP COLUMN format
      `);
      console.log('Dropped format column from reports table');
    }

    // Show current table structures
    console.log('\n=== Current Table Structures ===');
    
    const [savingsGoalsColumns] = await connection.execute('DESCRIBE savings_goals');
    console.log('savings_goals columns:', savingsGoalsColumns.map(col => col.Field));
    
    const [reportsColumns] = await connection.execute('DESCRIBE reports');
    console.log('reports columns:', reportsColumns.map(col => col.Field));

    console.log('\n✅ Database schema fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the fix
fixDatabaseSchema().catch(console.error);
