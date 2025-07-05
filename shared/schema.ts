
import {
  mysqlTable,
  text,
  varchar,
  timestamp,
  json,
  index,
  int,
  decimal,
  boolean,
  date,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = mysqlTable(
  "sessions",
  {
    sid: varchar("sid", { length: 128 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = mysqlTable("categories", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  color: varchar("color", { length: 20 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'income' or 'expense'
  userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = mysqlTable("transactions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  categoryId: int("category_id").references(() => categories.id, { onDelete: "cascade" }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description").notNull(),
  date: date("date").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'income' or 'expense'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const budgets = mysqlTable("budgets", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").references(() => users.id).notNull(),
  categoryId: int("category_id").references(() => categories.id).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  period: varchar("period", { length: 20 }).notNull(), // 'monthly', 'weekly', 'yearly'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const savingsGoals = mysqlTable("savings_goals", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  targetAmount: decimal("target_amount", { precision: 15, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 15, scale: 2 }).default("0"),
  targetDate: date("target_date").notNull(),
  icon: varchar("icon", { length: 50 }).default("fas fa-piggy-bank"),
  color: varchar("color", { length: 20 }).default("#3B82F6"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiInsights = mysqlTable("ai_insights", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'budget_alert', 'saving_tip', 'investment_suggestion', 'spending_pattern', 'smart_decision'
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  priority: varchar("priority", { length: 10 }).default('medium'), // 'high', 'medium', 'low'
  actionable: boolean("actionable").default(true),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = mysqlTable("reports", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'monthly', 'quarterly', 'yearly'
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  status: varchar("status", { length: 20 }).default('pending'),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Zod schemas
export const insertUserSchema_ = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const savingsGoalsSchema = createInsertSchema(savingsGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSavingsGoalSchema = createInsertSchema(savingsGoals).pick({
  name: true,
  description: true,
  targetAmount: true,
  currentAmount: true,
  targetDate: true,
  icon: true,
  color: true,
  userId: true,
});

export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;

export const insertAiInsightSchema = createInsertSchema(aiInsights).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// User schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
});

export const loginUserSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerUserSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  name: z.string().min(2, "Nama minimal 2 karakter"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal_ = z.infer<typeof savingsGoalsSchema>;
export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
