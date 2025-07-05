import {
  users,
  categories,
  transactions,
  budgets,
  savingsGoals,
  aiInsights,
  reports,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Transaction,
  type InsertTransaction,
  type Budget,
  type InsertBudget,
  type SavingsGoal,
  type InsertSavingsGoal,
  type AiInsight,
  type InsertAiInsight,
  type Report,
  type InsertReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sum, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  getCategoriesByType(userId: string, type: 'income' | 'expense'): Promise<Category[]>;
  getCategoryById(categoryId: number): Promise<Category | null>;
  deleteAllUserCategories(userId: string): Promise<void>;

  // Transaction operations
  getTransactions(userId: string, limit?: number, offset?: number): Promise<Transaction[]>;
  getTransactionsByDateRange(userId: string, startDate: string, endDate: string): Promise<Transaction[]>;
  getTransactionsByCategory(userId: string, categoryId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: number, userId: string): Promise<void>;
  getTransactionSummary(userId: string, startDate: string, endDate: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    transactionCount: number;
  }>;

  // Budget operations
  getBudgets(userId: string): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget>;
  deleteBudget(id: number, userId: string): Promise<void>;
  getBudgetUsage(userId: string, categoryId: number, period: string): Promise<number>;

  // Savings goals operations
  getSavingsGoals(userId: string): Promise<SavingsGoal[]>;
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateSavingsGoal(id: number, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal>;
  deleteSavingsGoal(id: number, userId: string): Promise<void>;

  // AI insights operations
  getAiInsights(userId: string, limit?: number): Promise<AiInsight[]>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  markInsightAsRead(id: number, userId: string): Promise<void>;

  // Reports operations
  getReports(userId: string): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  deleteReport(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(id)));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(userId: string): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.userId, userId));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category);
    const insertId = result[0].insertId;

    // Fetch the created category since MySQL doesn't support RETURNING
    const [newCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, insertId))
      .limit(1);

    return newCategory;
  }

  async createCategoriesForNewUser(userId: string): Promise<Category[]> {
    // Check if user already has categories
    const existingCategories = await this.getCategories(userId);
    if (existingCategories.length > 0) {
      return existingCategories;
    }
    const userIdStr = userId;

    const defaultCategories = [
      // Income categories
      { name: "Gaji", icon: "fas fa-briefcase", color: "#10B981", type: "income" as const, userId },
      { name: "Bonus", icon: "fas fa-gift", color: "#059669", type: "income" as const, userId },
      { name: "Investasi", icon: "fas fa-chart-line", color: "#047857", type: "income" as const, userId },
      { name: "Freelance", icon: "fas fa-laptop", color: "#065F46", type: "income" as const, userId },
      { name: "Lainnya", icon: "fas fa-plus", color: "#064E3B", type: "income" as const, userId },

      // Expense categories
      { name: "Makanan & Minuman", icon: "fas fa-utensils", color: "#EF4444", type: "expense" as const, userId: userIdStr },
      { name: "Transportasi", icon: "fas fa-car", color: "#3B82F6", type: "expense" as const, userId: userIdStr },
      { name: "Bensin & Ongkos", icon: "fas fa-gas-pump", color: "#DC2626", type: "expense" as const, userId: userIdStr },
      { name: "Belanja Harian", icon: "fas fa-shopping-basket", color: "#B91C1C", type: "expense" as const, userId: userIdStr },
      { name: "Hiburan", icon: "fas fa-gamepad", color: "#F59E0B", type: "expense" as const, userId: userIdStr },
      { name: "Olahraga & Gym", icon: "fas fa-dumbbell", color: "#D97706", type: "expense" as const, userId: userIdStr },
      { name: "Kesehatan", icon: "fas fa-heart", color: "#10B981", type: "expense" as const, userId: userIdStr },
      { name: "Pendidikan", icon: "fas fa-graduation-cap", color: "#7C3AED", type: "expense" as const, userId: userIdStr },
      { name: "Pakaian & Fashion", icon: "fas fa-tshirt", color: "#8B5CF6", type: "expense" as const, userId: userIdStr },
      { name: "Perawatan & Kecantikan", icon: "fas fa-spa", color: "#EC4899", type: "expense" as const, userId: userIdStr },
      { name: "Utilitas (Listrik, Air)", icon: "fas fa-bolt", color: "#059669", type: "expense" as const, userId: userIdStr },
      { name: "Internet & Telp", icon: "fas fa-wifi", color: "#0891B2", type: "expense" as const, userId: userIdStr },
      { name: "Tagihan & Cicilan", icon: "fas fa-file-invoice", color: "#DC2626", type: "expense" as const, userId: userIdStr },
      { name: "Asuransi", icon: "fas fa-shield-alt", color: "#047857", type: "expense" as const, userId: userIdStr },
      { name: "Hadiah & Donasi", icon: "fas fa-gift", color: "#DB2777", type: "expense" as const, userId: userIdStr },
      { name: "Traveling & Liburan", icon: "fas fa-plane", color: "#B45309", type: "expense" as const, userId: userIdStr },
      { name: "Hobi", icon: "fas fa-palette", color: "#7C2D12", type: "expense" as const, userId: userIdStr },
      { name: "Darurat", icon: "fas fa-exclamation-triangle", color: "#991B1B", type: "expense" as const, userId: userIdStr },
      { name: "Lainnya", icon: "fas fa-ellipsis-h", color: "#6B7280", type: "expense" as const, userId: userIdStr },
    ];

    let createdCount = 0;
    for (const category of defaultCategories) {
      try {
        await this.createCategory(category);
        createdCount++;
      } catch (error) {
        console.error("Error creating category:", category.name, error);
      }
    }

    return await this.getCategories(userIdStr);
  }

  async getCategoriesByType(userId: string, type: 'income' | 'expense'): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(and(eq(categories.userId, userId), eq(categories.type, type)));
  }

    async getCategoryById(categoryId: number): Promise<Category | null> {
    const result = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);
    return result[0] || null;
  }

  async deleteAllUserCategories(userId: string): Promise<void> {
    await db.delete(categories).where(eq(categories.userId, userId));
  }

  // Transaction operations
  async getTransactions(userId: string, limit = 50, offset = 0): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getTransactionsByDateRange(userId: string, startDate: string, endDate: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .orderBy(desc(transactions.date));
  }

  async getTransactionsByCategory(userId: string, categoryId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.categoryId, categoryId)))
      .orderBy(desc(transactions.date));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction);
    const insertId = result[0].insertId;

    // Fetch the created transaction since MySQL doesn't support RETURNING
    const [newTransaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, insertId))
      .limit(1);

    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction> {
    await db
      .update(transactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(transactions.id, id));

    // Fetch the updated transaction since MySQL doesn't support RETURNING
    const [updatedTransaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);

    return updatedTransaction;
  }

  async deleteTransaction(id: number, userId: string): Promise<void> {
    await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
  }

  async getTransactionSummary(userId: string, startDate: string, endDate: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    transactionCount: number;
  }> {
    const result = await db
      .select({
        type: transactions.type,
        totalAmount: sum(transactions.amount),
        count: count(),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .groupBy(transactions.type);

    let totalIncome = 0;
    let totalExpenses = 0;
    let transactionCount = 0;

    result.forEach((row) => {
      const amount = parseFloat(row.totalAmount || '0');
      const count = row.count || 0;

      if (row.type === 'income') {
        totalIncome = amount;
      } else if (row.type === 'expense') {
        totalExpenses = amount;
      }

      transactionCount += count;
    });

    return { totalIncome, totalExpenses, transactionCount };
  }

  // Budget operations
  async getBudgets(userId: string): Promise<Budget[]> {
    return await db.select().from(budgets).where(eq(budgets.userId, userId));
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const result = await db.insert(budgets).values(budget);
    const insertId = result[0].insertId;

    // Fetch the created budget since MySQL doesn't support RETURNING
    const [newBudget] = await db
      .select()
      .from(budgets)
      .where(eq(budgets.id, insertId))
      .limit(1);

    return newBudget;
  }

  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget> {
    await db
      .update(budgets)
      .set({ ...budget, updatedAt: new Date() })
      .where(eq(budgets.id, id));

    // Fetch the updated budget since MySQL doesn't support RETURNING
    const [updatedBudget] = await db
      .select()
      .from(budgets)
      .where(eq(budgets.id, id))
      .limit(1);

    return updatedBudget;
  }

  async deleteBudget(id: number, userId: string): Promise<void> {
    await db
      .delete(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
  }

  async getBudgetUsage(userId: string, categoryId: number, period: string): Promise<number> {
    const now = new Date();
    let startDate: string;

    switch (period) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'weekly':
        const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startDate = firstDayOfWeek.toISOString().split('T')[0];
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    }

    const endDate = new Date().toISOString().split('T')[0];

    const [result] = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.categoryId, categoryId),
          eq(transactions.type, 'expense'),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      );

    return parseFloat(result?.total || '0');
  }

  // Savings goals operations
  async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    return await db
      .select()
      .from(savingsGoals)
      .where(eq(savingsGoals.userId, userId))
      .orderBy(desc(savingsGoals.createdAt));
  }

  async createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal> {
    try {
      console.log('Inserting savings goal:', goal);
      const result = await db.insert(savingsGoals).values(goal);
      const insertId = result[0].insertId;

      // Fetch the created savings goal since MySQL doesn't support RETURNING
      const [newGoal] = await db
        .select()
        .from(savingsGoals)
        .where(eq(savingsGoals.id, insertId))
        .limit(1);

      console.log('Created savings goal:', newGoal);
      return newGoal;
    } catch (error) {
      console.error('Error in createSavingsGoal:', error);
      throw error;
    }
  }

  async updateSavingsGoal(id: number, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal> {
    await db
      .update(savingsGoals)
      .set({ ...goal, updatedAt: new Date() })
      .where(eq(savingsGoals.id, id));

    // Fetch the updated goal since MySQL doesn't support RETURNING
    const [updatedGoal] = await db
      .select()
      .from(savingsGoals)
      .where(eq(savingsGoals.id, id))
      .limit(1);

    return updatedGoal;
  }

  async deleteSavingsGoal(id: number, userId: string): Promise<void> {
    await db
      .delete(savingsGoals)
      .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, userId)));
  }

  // AI insights operations
  async getAiInsights(userId: string, limit = 10): Promise<AiInsight[]> {
    return await db
      .select()
      .from(aiInsights)
      .where(eq(aiInsights.userId, userId))
      .orderBy(desc(aiInsights.createdAt))
      .limit(limit);
  }

  async createAiInsight(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    priority?: string;
    actionable?: boolean;
    isRead?: boolean;
  }) {
    const result = await db
      .insert(aiInsights)
      .values({
        userId: parseInt(data.userId),
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || 'medium',
        actionable: data.actionable ?? true,
        isRead: data.isRead ?? false,
      });

    const insertId = result[0].insertId;

    // Fetch the created insight since MySQL doesn't support RETURNING
    const [insight] = await db
      .select()
      .from(aiInsights)
      .where(eq(aiInsights.id, insertId))
      .limit(1);

    return insight;
  }

  async deleteOldAiInsights(userId: string): Promise<void> {
    try {
      const result = await db.delete(aiInsights).where(eq(aiInsights.userId, parseInt(userId)));
      console.log(`Deleted old insights for user ${userId}`);
    } catch (error) {
      console.error("Error deleting old AI insights:", error);
      throw error;
    }
  }

  async markInsightAsRead(id: number, userId: string): Promise<void> {
    await db
      .update(aiInsights)
      .set({ isRead: true })
      .where(and(eq(aiInsights.id, id), eq(aiInsights.userId, userId)));
  }

  // Reports operations
  async getReports(userId: string): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.createdAt));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const reportData = {
      ...report,
      name: report.name || `Report ${new Date().toISOString().split('T')[0]}`,
      status: 'pending',
    };

    const result = await db.insert(reports).values(reportData);
    const insertId = result[0].insertId;

    // Fetch the created report since MySQL doesn't support RETURNING
    const [newReport] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, insertId))
      .limit(1);

    return newReport;
  }

  async deleteReport(id: number, userId: string): Promise<void> {
    await db
      .delete(reports)
      .where(and(eq(reports.id, id), eq(reports.userId, userId)));
  }

  

  async getUserById(userId: string): Promise<User | null> {
    const result = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async getTransactionsByDateRangeWithCategory(userId: string, startDate: string, endDate: string) {
    const result = await db
      .select({
        transaction: transactions,
        category: {
          name: categories.name,
          icon: categories.icon,
          color: categories.color,
        },
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .orderBy(desc(transactions.date));

    return result.map((row) => ({
      ...row.transaction,
      category: row.category,
    }));
  }
}

export const storage = new DatabaseStorage();