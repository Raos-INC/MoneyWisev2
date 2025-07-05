
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixCompleteDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'moneywise'
  });

  try {
    console.log('🔄 Fixing complete database structure...');
    
    // Disable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // 1. Check and fix users table
    console.log('Checking users table...');
    const [userRows] = await connection.execute('SELECT * FROM users LIMIT 1');
    if (userRows.length > 0) {
      const firstUser = userRows[0];
      console.log('Current user structure:', firstUser);
      
      // If the user ID is not auto-increment, we need to update it
      if (firstUser.id === "0" || typeof firstUser.id === 'string') {
        console.log('Fixing user ID...');
        
        // Update the user ID to be a proper integer
        await connection.execute('UPDATE users SET id = 1 WHERE id = ?', [firstUser.id]);
        console.log('Updated user ID to 1');
      }
    }
    
    // 2. Delete all existing categories with invalid user_id
    console.log('Cleaning up invalid categories...');
    await connection.execute('DELETE FROM categories WHERE user_id = 0 OR user_id NOT IN (SELECT id FROM users)');
    
    // 3. Delete all existing transactions with invalid user_id
    console.log('Cleaning up invalid transactions...');
    await connection.execute('DELETE FROM transactions WHERE user_id = 0 OR user_id NOT IN (SELECT id FROM users)');
    
    // 4. Delete all existing savings_goals with invalid user_id
    console.log('Cleaning up invalid savings goals...');
    await connection.execute('DELETE FROM savings_goals WHERE user_id = 0 OR user_id NOT IN (SELECT id FROM users)');
    
    // 5. Create default categories for existing users
    const [users] = await connection.execute('SELECT id FROM users');
    
    for (const user of users) {
      const userId = user.id;
      console.log(`Creating default categories for user ${userId}...`);
      
      const defaultCategories = [
        // Income categories
        { name: 'Gaji', icon: 'fas fa-briefcase', color: '#10B981', type: 'income' },
        { name: 'Bonus', icon: 'fas fa-gift', color: '#059669', type: 'income' },
        { name: 'Investasi', icon: 'fas fa-chart-line', color: '#047857', type: 'income' },
        { name: 'Freelance', icon: 'fas fa-laptop', color: '#065F46', type: 'income' },
        { name: 'Lainnya', icon: 'fas fa-plus', color: '#064E3B', type: 'income' },
        
        // Expense categories
        { name: 'Makanan', icon: 'fas fa-utensils', color: '#EF4444', type: 'expense' },
        { name: 'Transportasi', icon: 'fas fa-car', color: '#3B82F6', type: 'expense' },
        { name: 'Hiburan', icon: 'fas fa-gamepad', color: '#F59E0B', type: 'expense' },
        { name: 'Kesehatan', icon: 'fas fa-heart', color: '#10B981', type: 'expense' },
        { name: 'Belanja', icon: 'fas fa-shopping-bag', color: '#8B5CF6', type: 'expense' },
        { name: 'Tagihan', icon: 'fas fa-file-invoice', color: '#DC2626', type: 'expense' },
        { name: 'Pendidikan', icon: 'fas fa-graduation-cap', color: '#7C3AED', type: 'expense' },
        { name: 'Lainnya', icon: 'fas fa-ellipsis-h', color: '#6B7280', type: 'expense' },
      ];
      
      for (const category of defaultCategories) {
        try {
          await connection.execute(
            'INSERT INTO categories (name, icon, color, type, user_id) VALUES (?, ?, ?, ?, ?)',
            [category.name, category.icon, category.color, category.type, userId]
          );
        } catch (error) {
          console.log(`Category ${category.name} might already exist for user ${userId}`);
        }
      }
    }
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    // Show current status
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [categoryCount] = await connection.execute('SELECT COUNT(*) as count FROM categories');
    const [transactionCount] = await connection.execute('SELECT COUNT(*) as count FROM transactions');
    const [savingsCount] = await connection.execute('SELECT COUNT(*) as count FROM savings_goals');
    
    console.log('\n✅ Database fix completed!');
    console.log('Current status:');
    console.log(`- Users: ${userCount[0].count}`);
    console.log(`- Categories: ${categoryCount[0].count}`);
    console.log(`- Transactions: ${transactionCount[0].count}`);
    console.log(`- Savings Goals: ${savingsCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the fix
fixCompleteDatabase().catch(console.error);
