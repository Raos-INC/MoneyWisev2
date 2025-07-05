import { db } from './db';
import { categories } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function initializeDefaultCategories(userId: number) {
  // Check if user already has categories
  const existingCategories = await db.select().from(categories).where(eq(categories.userId, userId)).limit(1);

  if (existingCategories.length > 0) {
    return; // User already has categories
  }

  const defaultCategories = [
    // Income Categories
    { name: 'Gaji Utama', icon: '💰', color: '#10B981', type: 'income', userId },
    { name: 'Gaji Tambahan', icon: '💵', color: '#059669', type: 'income', userId },
    { name: 'Bonus & Tunjangan', icon: '🎁', color: '#047857', type: 'income', userId },
    { name: 'Hasil Investasi', icon: '📈', color: '#065F46', type: 'income', userId },
    { name: 'Freelance/Proyek', icon: '💻', color: '#16A34A', type: 'income', userId },
    { name: 'Bisnis Sampingan', icon: '🏪', color: '#15803D', type: 'income', userId },
    { name: 'Hadiah/Hibah', icon: '🎉', color: '#166534', type: 'income', userId },
    { name: 'Passive Income', icon: '🔄', color: '#14532D', type: 'income', userId },

    // Daily Expense Categories
    { name: 'Makanan & Minuman', icon: '🍽️', color: '#EF4444', type: 'expense', userId },
    { name: 'Transportasi', icon: '🚗', color: '#DC2626', type: 'expense', userId },
    { name: 'Bensin/Ongkos', icon: '⛽', color: '#B91C1C', type: 'expense', userId },
    { name: 'Belanja Harian', icon: '🛒', color: '#991B1B', type: 'expense', userId },

    // Lifestyle Categories
    { name: 'Hiburan', icon: '🎬', color: '#7F1D1D', type: 'expense', userId },
    { name: 'Olahraga & Gym', icon: '🏋️', color: '#F59E0B', type: 'expense', userId },
    { name: 'Hobi', icon: '🎨', color: '#D97706', type: 'expense', userId },
    { name: 'Traveling', icon: '✈️', color: '#B45309', type: 'expense', userId },

    // Essential Categories
    { name: 'Kesehatan', icon: '🏥', color: '#7C2D12', type: 'expense', userId },
    { name: 'Pendidikan', icon: '📚', color: '#3B82F6', type: 'expense', userId },
    { name: 'Utilitas (Listrik, Air)', icon: '⚡', color: '#2563EB', type: 'expense', userId },
    { name: 'Internet & Telp', icon: '📱', color: '#1D4ED8', type: 'expense', userId },

    // Fashion & Beauty
    { name: 'Pakaian & Fashion', icon: '👔', color: '#7C3AED', type: 'expense', userId },
    { name: 'Perawatan & Kecantikan', icon: '💅', color: '#6D28D9', type: 'expense', userId },

    // Financial Categories
    { name: 'Asuransi', icon: '🛡️', color: '#059669', type: 'expense', userId },
    { name: 'Cicilan/Kredit', icon: '🏦', color: '#047857', type: 'expense', userId },
    { name: 'Tabungan Wajib', icon: '🏦', color: '#065F46', type: 'expense', userId },

    // Others
    { name: 'Hadiah/Donasi', icon: '🎁', color: '#DB2777', type: 'expense', userId },
    { name: 'Perawatan Rumah', icon: '🏠', color: '#BE185D', type: 'expense', userId },
    { name: 'Darurat', icon: '🚨', color: '#9F1239', type: 'expense', userId },
    { name: 'Lainnya', icon: '📝', color: '#6B7280', type: 'expense', userId },
  ];

  await db.insert(categories).values(defaultCategories);
}