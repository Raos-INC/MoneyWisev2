import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  authenticateToken, 
  createUser, 
  findUserByEmail, 
  comparePassword, 
  generateToken,
  type AuthRequest 
} from "./auth";
import { isAuthenticated } from "./replitAuth";

import { 
  analyzeSpendingPatterns, 
  generateFinancialAdvice, 
  analyzeInvestmentOpportunity,
  analyzeSmartPurchaseDecision 
} from "./services/gemini";
import { 
  insertTransactionSchema, 
  insertCategorySchema,
  insertBudgetSchema,
  insertSavingsGoalSchema,
  loginUserSchema,
  registerUserSchema
} from "@shared/schema";
import { generateReport } from "./services/reportGenerator";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name } = registerUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      // Create new user
      const user = await createUser(email, password, name);
      const token = generateToken({ id: user.id, email: user.email, name: user.name });

      // Create default categories for new user
      const userId = user.id.toString();

      try {
        await storage.createCategoriesForNewUser(userId);
        console.log(`Successfully created default categories for user ${userId}`);
      } catch (error) {
        console.error("Error creating default categories for new user:", error);
      }

      res.status(201).json({
        user: { id: user.id, email: user.email, name: user.name },
        token,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(400).json({ message: "Gagal mendaftarkan user" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginUserSchema.parse(req.body);

      // Find user
      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      // Check password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      // Generate token
      const token = generateToken({ id: user.id, email: user.email, name: user.name });

      res.json({
        user: { id: user.id, email: user.email, name: user.name },
        token,
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(400).json({ message: "Gagal login" });
    }
  });

  app.get('/api/auth/user', authenticateToken, async (req: AuthRequest, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/logout', (req, res) => {
    // Clear the token from client side by redirecting to landing
    res.json({ message: "Logged out successfully", redirect: "/" });
  });

  app.post('/api/logout', (req, res) => {
    // Clear the token from client side by redirecting to landing
    res.json({ message: "Logged out successfully", redirect: "/" });
  });

  // Initialize default categories for users
  app.post('/api/initialize', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();

      // Check if user already has categories
      const existingCategories = await storage.getCategories(userId);
      if (existingCategories.length > 0) {
        return res.json({ 
          message: "Already initialized", 
          categories: existingCategories.length 
        });
      }

      // Create default categories
      const defaultCategories = [
        // Income categories
        { name: "Gaji", icon: "fas fa-briefcase", color: "#10B981", type: "income", userId: userId },
        { name: "Bonus", icon: "fas fa-gift", color: "#059669", type: "income", userId: userId },
        { name: "Investasi", icon: "fas fa-chart-line", color: "#047857", type: "income", userId: userId },
        { name: "Freelance", icon: "fas fa-laptop", color: "#065F46", type: "income", userId: userId },
        { name: "Lainnya", icon: "fas fa-plus", color: "#064E3B", type: "income", userId: userId },

        // Expense categories
        { name: "Makanan", icon: "fas fa-utensils", color: "#EF4444", type: "expense", userId: userId },
        { name: "Transportasi", icon: "fas fa-car", color: "#3B82F6", type: "expense", userId: userId },
        { name: "Hiburan", icon: "fas fa-gamepad", color: "#F59E0B", type: "expense", userId: userId },
        { name: "Kesehatan", icon: "fas fa-heart", color: "#10B981", type: "expense", userId: userId },
        { name: "Belanja", icon: "fas fa-shopping-bag", color: "#8B5CF6", type: "expense", userId: userId },
        { name: "Tagihan", icon: "fas fa-file-invoice", color: "#DC2626", type: "expense", userId: userId },
        { name: "Pendidikan", icon: "fas fa-graduation-cap", color: "#7C3AED", type: "expense", userId: userId },
        { name: "Lainnya", icon: "fas fa-ellipsis-h", color: "#6B7280", type: "expense", userId: userId },
      ];

      let createdCount = 0;
      for (const category of defaultCategories) {
        try {
          await storage.createCategory(category);
          createdCount++;
        } catch (error) {
          console.error("Error creating category:", category.name, error);
        }
      }

      res.json({ 
        message: "Initialized successfully", 
        categoriesCreated: createdCount 
      });
    } catch (error) {
      console.error("Error initializing user:", error);
      res.status(500).json({ message: "Failed to initialize" });
    }
  });

  // Categories routes
  app.get('/api/categories', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      let categories = await storage.getCategories(userId);

      // If user has no categories, create default ones
      if (categories.length === 0) {
        const defaultCategories = [
          // Income categories
          { name: "Gaji", icon: "fas fa-briefcase", color: "#10B981", type: "income" as const, userId: userId },
          { name: "Bonus", icon: "fas fa-gift", color: "#059669", type: "income" as const, userId: userId },
          { name: "Investasi", icon: "fas fa-chart-line", color: "#047857", type: "income" as const, userId: userId },
          { name: "Freelance", icon: "fas fa-laptop", color: "#065F46", type: "income" as const, userId: userId },
          { name: "Lainnya", icon: "fas fa-plus", color: "#064E3B", type: "income" as const, userId: userId },

          // Expense categories
          { name: "Makanan", icon: "fas fa-utensils", color: "#EF4444", type: "expense" as const, userId: userId },
          { name: "Transportasi", icon: "fas fa-car", color: "#3B82F6", type: "expense" as const, userId: userId },
          { name: "Hiburan", icon: "fas fa-gamepad", color: "#F59E0B", type: "expense" as const, userId: userId },
          { name: "Kesehatan", icon: "fas fa-heart", color: "#10B981", type: "expense" as const, userId: userId },
          { name: "Belanja", icon: "fas fa-shopping-bag", color: "#8B5CF6", type: "expense" as const, userId: userId },
          { name: "Tagihan", icon: "fas fa-file-invoice", color: "#DC2626", type: "expense" as const, userId: userId },
          { name: "Pendidikan", icon: "fas fa-graduation-cap", color: "#7C3AED", type: "expense" as const, userId: userId },
          { name: "Lainnya", icon: "fas fa-ellipsis-h", color: "#6B7280", type: "expense" as const, userId: userId },
        ];

        for (const category of defaultCategories) {
          try {
            await storage.createCategory(category);
          } catch (error) {
            console.error("Error creating default category:", category.name, error);
          }
        }

        // Fetch categories again after creating defaults
        categories = await storage.getCategories(userId);
      }

      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/categories/:type', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const { type } = req.params;

      if (type !== 'income' && type !== 'expense') {
        return res.status(400).json({ message: "Invalid category type" });
      }

      let categories = await storage.getCategoriesByType(userId, type);

      // If user has no categories of this type, check if they have any categories at all
      if (categories.length === 0) {
        const allCategories = await storage.getCategories(userId);

        // If user has no categories at all, create default ones
        if (allCategories.length === 0) {
          const defaultCategories = [
            // Income categories
            { name: "Gaji", icon: "fas fa-briefcase", color: "#10B981", type: "income" as const, userId: userId },
            { name: "Bonus", icon: "fas fa-gift", color: "#059669", type: "income" as const, userId: userId },
            { name: "Investasi", icon: "fas fa-chart-line", color: "#047857", type: "income" as const, userId: userId },
            { name: "Freelance", icon: "fas fa-laptop", color: "#065F46", type: "income" as const, userId: userId },
            { name: "Lainnya", icon: "fas fa-plus", color: "#064E3B", type: "income" as const, userId: userId },

            // Expense categories
            { name: "Makanan", icon: "fas fa-utensils", color: "#EF4444", type: "expense" as const, userId: userId },
            { name: "Transportasi", icon: "fas fa-car", color: "#3B82F6", type: "expense" as const, userId: userId },
            { name: "Hiburan", icon: "fas fa-gamepad", color: "#F59E0B", type: "expense" as const, userId: userId },
            { name: "Kesehatan", icon: "fas fa-heart", color: "#10B981", type: "expense" as const, userId: userId },
            { name: "Belanja", icon: "fas fa-shopping-bag", color: "#8B5CF6", type: "expense" as const, userId: userId },
            { name: "Tagihan", icon: "fas fa-file-invoice", color: "#DC2626", type: "expense" as const, userId: userId },
            { name: "Pendidikan", icon: "fas fa-graduation-cap", color: "#7C3AED", type: "expense" as const, userId: userId },
            { name: "Lainnya", icon: "fas fa-ellipsis-h", color: "#6B7280", type: "expense" as const, userId: userId },
          ];

          for (const category of defaultCategories) {
            try {
              await storage.createCategory(category);
            } catch (error) {
              console.error("Error creating default category:", category.name, error);
            }
          }

          // Fetch categories again after creating defaults
          categories = await storage.getCategoriesByType(userId, type);
        }
      }

      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories by type:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const categoryData = insertCategorySchema.parse({
        ...req.body,
        userId
      });

      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Transactions routes
  app.get('/api/transactions', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const transactions = await storage.getTransactions(userId, limit, offset);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get('/api/transactions/summary', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const summary = await storage.getTransactionSummary(
        userId, 
        startDate as string, 
        endDate as string
      );
      res.json(summary);
    } catch (error) {
      console.error("Error fetching transaction summary:", error);
      res.status(500).json({ message: "Failed to fetch transaction summary" });
    }
  });

  // Create new transaction
  app.post('/api/transactions', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { amount, description, type, categoryId, date } = req.body;
      const userId = req.user!.id;

      // Validate required fields
      if (!amount || !description || !type || !categoryId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Validate amount is a positive number
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }

      // Validate type
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: "Type must be 'income' or 'expense'" });
      }

      // Validate categoryId exists
      const category = await storage.getCategoryById(parseInt(categoryId));
      if (!category) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const transaction = await storage.createTransaction({
        userId: userId.toString(),
        amount: numAmount.toString(),
        description: description.trim(),
        type,
        categoryId: parseInt(categoryId),
        date: date || new Date().toISOString().split('T')[0]
      });

      // Return transaction with category info for immediate UI update
      const transactionWithCategory = {
        ...transaction,
        category: {
          name: category.name,
          icon: category.icon,
          color: category.color
        }
      };

      // Auto-generate insights after transaction creation
      setImmediate(async () => {
        try {
          await autoGenerateInsights(userId.toString());
        } catch (error) {
          console.error("Error in auto-generating insights:", error);
        }
      });

      res.status(201).json(transactionWithCategory);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.put('/api/transactions/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const transactionId = parseInt(req.params.id);
      const updateData = req.body;

      const transaction = await storage.updateTransaction(transactionId, updateData);
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  app.delete('/api/transactions/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const transactionId = parseInt(req.params.id);

      await storage.deleteTransaction(transactionId, userId);
      res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Budgets routes
  app.get('/api/budgets', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const budgets = await storage.getBudgets(userId);
      res.json(budgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post('/api/budgets', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const budgetData = insertBudgetSchema.parse({
        ...req.body,
        userId
      });

      const budget = await storage.createBudget(budgetData);
      res.json(budget);
    } catch (error) {
      console.error("Error creating budget:", error);
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  // Savings goals routes
  app.get('/api/savings-goals', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const goals = await storage.getSavingsGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching savings goals:", error);
      res.status(500).json({ message: "Failed to fetch savings goals" });
    }
  });

  app.post('/api/savings-goals', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const { name, title, description, targetAmount, currentAmount, targetDate, icon, color } = req.body;

      // Validate required fields
      const goalName = name || title;
      if (!goalName || !targetAmount || !targetDate) {
        return res.status(400).json({ message: "Name, target amount, and target date are required" });
      }

      const goalData = {
        userId: parseInt(userId.toString()),
        name: goalName,
        description: description || "",
        targetAmount: parseFloat(targetAmount.toString().replace(/[^\d]/g, '')).toString(),
        currentAmount: currentAmount ? parseFloat(currentAmount.toString().replace(/[^\d]/g, '')).toString() : "0",
        targetDate: targetDate,
        icon: icon || "fas fa-piggy-bank",
        color: color || "#3B82F6"
      };

      console.log('Creating savings goal with data:', goalData);
      const goal = await storage.createSavingsGoal(goalData);
      res.json(goal);
    } catch (error) {
      console.error("Error creating savings goal:", error);
      res.status(500).json({ message: "Failed to create savings goal", error: error.message });
    }
  });

  app.put('/api/savings-goals/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const goalId = parseInt(req.params.id);
      const updateData = req.body;

      const goal = await storage.updateSavingsGoal(goalId, updateData);
      res.json(goal);
    } catch (error) {
      console.error("Error updating savings goal:", error);
      res.status(500).json({ message: "Failed to update savings goal" });
    }
  });

  // Savings simulation endpoint
  app.post('/api/savings-goals/simulate', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { targetAmount, targetDate, currentAmount = 0 } = req.body;

      if (!targetAmount || !targetDate) {
        return res.status(400).json({ message: "Target amount and date are required" });
      }

      const target = new Date(targetDate);
      const now = new Date();

      if (target <= now) {
        return res.status(400).json({ message: "Target date must be in the future" });
      }

      const amount = parseFloat(targetAmount);
      const current = parseFloat(currentAmount);
      const remainingAmount = amount - current;

      const totalDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const totalWeeks = Math.ceil(totalDays / 7);
      const totalMonths = Math.max(1, 
        (target.getFullYear() - now.getFullYear()) * 12 + 
        (target.getMonth() - now.getMonth())
      );

      const simulation = {
        targetAmount: amount,
        currentAmount: current,
        remainingAmount,
        totalDays,
        totalWeeks,
        totalMonths,
        dailyAmount: remainingAmount / totalDays,
        weeklyAmount: remainingAmount / totalWeeks,
        monthlyAmount: remainingAmount / totalMonths,
        targetDate: target,
        feasibilityScore: calculateFeasibilityScore(remainingAmount, totalDays),
        recommendations: generateSavingsRecommendations(remainingAmount, totalDays, totalMonths),
      };

      res.json(simulation);
    } catch (error) {
      console.error("Error simulating savings goal:", error);
      res.status(500).json({ message: "Failed to simulate savings goal" });
    }
  });

  // AI insights routes
  app.get('/api/ai-insights', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const insights = await storage.getAiInsights(userId);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      res.status(500).json({ message: "Failed to fetch AI insights" });
    }
  });

  // PDF export endpoint
  app.get('/api/reports/export/pdf', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const { generatePDFReport } = await import('./services/pdfGenerator');
      const pdfBuffer = await generatePDFReport(
        userId, 
        startDate as string, 
        endDate as string
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="financial-report.pdf"');
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF report:", error);
      res.status(500).json({ message: "Failed to generate PDF report" });
    }
  });

  // Email PDF report endpoint
  app.post('/api/reports/email', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const { startDate, endDate, email } = req.body;

      if (!startDate || !endDate || !email) {
        return res.status(400).json({ message: "Start date, end date, and email are required" });
      }

      const { generatePDFReport } = await import('./services/pdfGenerator');
      const pdfBuffer = await generatePDFReport(userId, startDate, endDate);

      // Here you would integrate with an email service like SendGrid, Nodemailer, etc.
      // For now, we'll just return success
      res.json({ 
        message: "Email akan dikirim ke " + email,
        success: true 
      });
    } catch (error) {
      console.error("Error sending email report:", error);
      res.status(500).json({ message: "Failed to send email report" });
    }
  });

  app.post('/api/ai-insights/analyze', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const transactions = await storage.getTransactions(userId, 50);

      const insights = await analyzeSpendingPatterns(transactions);

      // Save insights to database
      for (const insight of insights) {
        await storage.createAiInsight({
          userId: userId.toString(),
          type: insight.type,
          title: insight.title,
          message: insight.message,
        });
      }

      res.json(insights);
    } catch (error) {
      console.error("Error analyzing spending patterns:", error);
      res.status(500).json({ message: "Failed to analyze spending patterns" });
    }
  });

  // Generate new AI insights
  app.post('/api/ai-insights/generate', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();

      console.log(`Manual insight generation requested by user ${userId}`);

      const transactions = await storage.getTransactions(userId);

      if (transactions.length === 0) {
        return res.json({ 
          message: "Tidak ada transaksi untuk dianalisis",
          insights: [],
          count: 0
        });
      }

      console.log(`Found ${transactions.length} transactions for analysis`);

      // Delete old insights first
      await storage.deleteOldAiInsights(userId);

      const insights = await analyzeSpendingPatterns(transactions);

      console.log(`Generated ${insights.length} insights`);

      // Save new insights to database
      let savedCount = 0;
      for (const insight of insights) {
        try {
          await storage.createAiInsight({
            userId: userId.toString(),
            type: insight.type,
            title: insight.title,
            message: insight.message,
            priority: insight.priority || 'medium',
            actionable: insight.actionable || true,
            isRead: false,
          });
          savedCount++;
        } catch (saveError) {
          console.error("Error saving insight:", saveError);
        }
      }

      console.log(`Saved ${savedCount} insights to database`);

      res.json({ 
        message: `${savedCount} insight baru berhasil dihasilkan`,
        insights, 
        count: savedCount 
      });
    } catch (error) {
      console.error("Error generating AI insights:", error);
      res.status(500).json({ 
        message: "Failed to generate AI insights",
        error: error.message 
      });
    }
  });

  // Auto-generate AI insights when new transactions are added
  async function autoGenerateInsights(userId: string) {
    try {
      const transactions = await storage.getTransactions(userId);

      if (transactions.length === 0) return;

      // Check if insights were generated recently (within last 4 hours for more frequent updates)
      const recentInsights = await storage.getAiInsights(userId);
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

      const hasRecentInsights = recentInsights.some(insight => 
        new Date(insight.createdAt) > fourHoursAgo
      );

      // Generate insights more frequently - every 3 transactions or if no recent insights
      if (hasRecentInsights && transactions.length < 3) return;

      console.log(`Auto-generating insights for user ${userId} with ${transactions.length} transactions`);

      // Delete old insights to keep fresh
      await storage.deleteOldAiInsights(userId);

      const insights = await analyzeSpendingPatterns(transactions);

      if (insights.length > 0) {
        // Save insights to database
        for (const insight of insights) {
          await storage.createAiInsight({
            userId: userId.toString(),
            type: insight.type,
            title: insight.title,
            message: insight.message,
            priority: insight.priority || 'medium',
            actionable: insight.actionable || true,
            isRead: false,
          });
        }

        console.log(`Successfully generated ${insights.length} new insights for user ${userId}`);
      }
    } catch (error) {
      console.error("Error auto-generating AI insights:", error);
    }
  }

  // Smart purchase decision
  app.post('/api/smart-purchase-decision', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const { item, price, description } = req.body;

      // Get user financial summary
      const transactions = await storage.getTransactions(userId);
      const savingsGoals = await storage.getSavingsGoals(userId);

      const monthlyIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const monthlyExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const currentSavings = monthlyIncome - monthlyExpenses;

      const userProfile = {
        monthlyIncome,
        monthlyExpenses,
        savingsGoals: savingsGoals.length,
        currentSavings: Math.max(0, currentSavings),
      };

      const analysis = await analyzeSmartPurchaseDecision(item, price, description || '', userProfile);

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing purchase decision:", error);
      res.status(500).json({ message: "Failed to analyze purchase decision" });
    }
  });

  // User financial summary
  app.get('/api/user/financial-summary', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const transactions = await storage.getTransactions(userId);
      const savingsGoals = await storage.getSavingsGoals(userId);

      const monthlyIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const monthlyExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const summary = {
        monthlyIncome,
        monthlyExpenses,
        netBalance: monthlyIncome - monthlyExpenses,
        savingsGoals: savingsGoals.length,
        totalSavingsTarget: savingsGoals.reduce((sum, goal) => sum + parseFloat(goal.targetAmount || '0'), 0),
        totalCurrentSavings: savingsGoals.reduce((sum, goal) => sum + parseFloat(goal.currentAmount || '0'), 0),
      };

      res.json(summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });  // Financial advice endpoint
  app.post('/api/financial-advice', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const transactions = await storage.getTransactions(userId);
      const savingsGoals = await storage.getSavingsGoals(userId);

      const monthlyIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const monthlyExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const advice = await generateFinancialAdvice(monthlyIncome, monthlyExpenses, savingsGoals);

      res.json({ advice });
    } catch (error) {
      console.error("Error generating financial advice:", error);
      res.status(500).json({ message: "Failed to generate financial advice" });
    }
  });

  // Investment analysis endpoint
  app.post('/api/investment-analysis', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const { amount, riskProfile } = req.body;

      const analysis = await analyzeInvestmentOpportunity(amount, riskProfile);

      res.json({ analysis });
    } catch (error) {
      console.error("Error analyzing investment opportunity:", error);
      res.status(500).json({ message: "Failed to analyze investment opportunity" });
    }
  });

  // Tax calculator route
  app.post('/api/tax/calculate', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { grossIncome, maritalStatus, dependents, jobExpenses, pensionContribution } = req.body;

      // PTKP (Tax-free income) rates for 2024
      const ptkpRates = {
        'TK/0': 54_000_000,  // Single, no dependents
        'K/0': 58_500_000,   // Married, no dependents
        'K/1': 63_000_000,   // Married, 1 dependent
        'K/2': 67_500_000,   // Married, 2 dependents
        'K/3': 72_000_000,   // Married, 3 dependents
      };

      const ptkp = ptkpRates[maritalStatus as keyof typeof ptkpRates] || ptkpRates['TK/0'];

      // Calculate annual income
      const annualIncome = grossIncome * 12;

      // Deductions
      const totalDeductions = (jobExpenses || 0) * 12 + (pensionContribution || 0) * 12;
      const netIncome = annualIncome - totalDeductions;

      // Taxable income
      const taxableIncome = Math.max(0, netIncome - ptkp);

      // Tax calculation based on progressive rates
      let tax = 0;
      if (taxableIncome <= 60_000_000) {
        tax = taxableIncome * 0.05;
      } else if (taxableIncome <= 250_000_000) {
        tax = 60_000_000 * 0.05 + (taxableIncome - 60_000_000) * 0.15;
      } else if (taxableIncome <= 500_000_000) {
        tax = 60_000_000 * 0.05 + 190_000_000 * 0.15 + (taxableIncome - 250_000_000) * 0.25;
      } else {
        tax = 60_000_000 * 0.05 + 190_000_000 * 0.15 + 250_000_000 * 0.25 + (taxableIncome - 500_000_000) * 0.30;
      }

      const result = {
        grossIncome: annualIncome,
        ptkp,
        taxableIncome,
        annualTax: Math.round(tax),
        monthlyTax: Math.round(tax / 12),
        effectiveRate: taxableIncome > 0 ? (tax / taxableIncome) * 100 : 0,
        marginalRate: taxableIncome <= 60_000_000 ? 5 : 
                     taxableIncome <= 250_000_000 ? 15 :
                     taxableIncome <= 500_000_000 ? 25 : 30,
      };

      res.json(result);
    } catch (error) {
      console.error("Error calculating tax:", error);
      res.status(500).json({ message: "Failed to calculate tax" });
    }
  });

  // Force add categories for existing users
  app.post('/api/categories/force-init', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();

      // Delete existing categories first
      await storage.deleteAllUserCategories(userId);

      // Create default categories
      const defaultCategories = [
        // Income categories
        { name: "Gaji", icon: "fas fa-briefcase", color: "#10B981", type: "income" as const, userId: userId },
        { name: "Bonus", icon: "fas fa-gift", color: "#059669", type: "income" as const, userId: userId },
        { name: "Investasi", icon: "fas fa-chart-line", color: "#047857", type: "income" as const, userId: userId },
        { name: "Freelance", icon: "fas fa-laptop", color: "#065F46", type: "income" as const, userId: userId },
        { name: "Lainnya", icon: "fas fa-plus", color: "#064E3B", type: "income" as const, userId: userId },

        // Expense categories
        { name: "Makanan", icon: "fas fa-utensils", color: "#EF4444", type: "expense" as const, userId: userId },
        { name: "Transportasi", icon: "fas fa-car", color: "#3B82F6", type: "expense" as const, userId: userId },
        { name: "Hiburan", icon: "fas fa-gamepad", color: "#F59E0B", type: "expense" as const, userId: userId },
        { name: "Kesehatan", icon: "fas fa-heart", color: "#10B981", type: "expense" as const, userId: userId },
        { name: "Belanja", icon: "fas fa-shopping-bag", color: "#8B5CF6", type: "expense" as const, userId: userId },
        { name: "Tagihan", icon: "fas fa-file-invoice", color: "#DC2626", type: "expense" as const, userId: userId },
        { name: "Pendidikan", icon: "fas fa-graduation-cap", color: "#7C3AED", type: "expense" as const, userId: userId },
        { name: "Lainnya", icon: "fas fa-ellipsis-h", color: "#6B7280", type: "expense" as const, userId: userId },
      ];

      let createdCount = 0;
      for (const category of defaultCategories) {
        try {
          await storage.createCategory(category);
          createdCount++;
        } catch (error) {
          console.error("Error creating category:", category.name, error);
        }
      }

      res.json({ 
        message: "Categories created successfully", 
        categoriesCreated: createdCount 
      });
    } catch (error) {
      console.error("Error creating categories:", error);
      res.status(500).json({ message: "Failed to create categories" });
    }
  });

  // Seed all default categories to database (for admin use)
  app.post('/api/admin/seed-categories', async (req, res) => {
    try {
      // Import required modules
      const { db } = await import('./db');
      const { users } = await import('@shared/schema');

      // Get all users
      const allUsers = await db.select({ id: users.id }).from(users);

      let totalCreated = 0;
      let usersProcessed = 0;

      for (const user of allUsers) {
        const userId = user.id.toString();

        // Check if user already has categories
        const existingCategories = await storage.getCategories(userId);
        if (existingCategories.length > 0) {
          continue; // Skip if user already has categories
        }

        // Create default categories for this user
        const defaultCategories = [
          // Income categories
          { name: "Gaji", icon: "fas fa-briefcase", color: "#10B981", type: "income" as const, userId: userId },
          { name: "Bonus", icon: "fas fa-gift", color: "#059669", type: "income" as const, userId: userId },
          { name: "Investasi", icon: "fas fa-chart-line", color: "#047857", type: "income" as const, userId: userId },
          { name: "Freelance", icon: "fas fa-laptop", color: "#065F46", type: "income" as const, userId: userId },
          { name: "Lainnya", icon: "fas fa-plus", color: "#064E3B", type: "income" as const, userId: userId },

          // Expense categories
          { name: "Makanan", icon: "fas fa-utensils", color: "#EF4444", type: "expense" as const, userId: userId },
          { name: "Transportasi", icon: "fas fa-car", color: "#3B82F6", type: "expense" as const, userId: userId },
          { name: "Hiburan", icon: "fas fa-gamepad", color: "#F59E0B", type: "expense" as const, userId: userId },
          { name: "Kesehatan", icon: "fas fa-heart", color: "#10B981", type: "expense" as const, userId: userId },
          { name: "Belanja", icon: "fas fa-shopping-bag", color: "#8B5CF6", type: "expense" as const, userId: userId },
          { name: "Tagihan", icon: "fas fa-file-invoice", color: "#DC2626", type: "expense" as const, userId: userId },
          { name: "Pendidikan", icon: "fas fa-graduation-cap", color: "#7C3AED", type: "expense" as const, userId: userId },
          { name: "Lainnya", icon: "fas fa-ellipsis-h", color: "#6B7280", type: "expense" as const, userId: userId },
        ];

        for (const category of defaultCategories) {
          try {
            await storage.createCategory(category);
            totalCreated++;
          } catch (error) {
            console.error("Error creating category for user", userId, ":", category.name, error);
          }
        }
        usersProcessed++;
      }

      res.json({ 
        message: `Categories seeded successfully for ${usersProcessed} users`, 
        totalCategoriesCreated: totalCreated,
        usersProcessed: usersProcessed,
        totalUsers: allUsers.length
      });
    } catch (error) {
      console.error("Error seeding categories:", error);
      res.status(500).json({ message: "Failed to seed categories" });
    }
  });

  // Reports routes
  app.get('/api/reports', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const reports = await storage.getReports(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post('/api/reports/generate', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const { type, format, periodStart, periodEnd } = req.body;

      const reportData = await generateReport(userId, type, periodStart, periodEnd);

      const report = await storage.createReport({
        userId,
        title: `${type} Report - ${periodStart} to ${periodEnd}`,
        type,
        format,
        periodStart,
        periodEnd,
      });

      res.json({ report, data: reportData });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Export PDF report
  app.post('/api/reports/export-pdf', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id.toString();
      const { startDate, endDate, email } = req.body;

      // Get user data
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get financial data
      const transactions = await storage.getTransactionsByDateRange(userId, startDate, endDate);
      const savingsGoals = await storage.getSavingsGoals(userId);
      const categories = await storage.getCategories(userId);

      // Generate PDF using PDF generator
      const { generatePDFReport } = await import('./services/pdfGenerator');
      const pdfBuffer = await generatePDFReport(userId, startDate, endDate);

      if (email) {
        // Send via email
        const nodemailer = await import('nodemailer');

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASS || 'your-app-password'
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER || 'noreply@moneywise.com',
          to: email,
          subject: `MoneyWise - Laporan Keuangan ${new Date().toLocaleDateString('id-ID')}`,
          html: `
            <h2>Laporan Keuangan MoneyWise</h2>
            <p>Halo ${user.firstName || user.email},</p>
            <p>Berikut adalah laporan keuangan Anda untuk periode ${startDate} hingga ${endDate}.</p>
            <p>Laporan ini mencakup:</p>
            <ul>
              <li>Ringkasan transaksi pemasukan dan pengeluaran</li>
              <li>Progress target tabungan</li>
              <li>Analisis kategori pengeluaran</li>
            </ul>
            <p>Terima kasih telah menggunakan MoneyWise!</p>
            <p><em>Tim MoneyWise</em></p>
          `,
          attachments: [
            {
              filename: `financial-report-${new Date().toISOString().split('T')[0]}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        };

        await transporter.sendMail(mailOptions);
        res.json({ 
          success: true,
          message: "Laporan berhasil dikirim ke " + email 
        });
      } else {
        // Return PDF directly
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="financial-report-${new Date().toISOString().split('T')[0]}.pdf"`);
        res.send(pdfBuffer);
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      res.status(500).json({ message: "Gagal mengekspor laporan PDF" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
function calculateFeasibilityScore(remainingAmount: number, totalDays: number): number {
  const dailyAmount = remainingAmount / totalDays;

  // Simple scoring based on daily amount requirements
  if (dailyAmount <= 10000) return 90; // Very feasible
  if (dailyAmount <= 25000) return 75; // Feasible
  if (dailyAmount <= 50000) return 60; // Challenging
  if (dailyAmount <= 100000) return 40; // Difficult
  return 20; // Very difficult
}

function generateSavingsRecommendations(remainingAmount: number, totalDays: number, totalMonths: number): string[] {
  const dailyAmount = remainingAmount / totalDays;
  const monthlyAmount = remainingAmount / totalMonths;

  const recommendations = [];

  if (dailyAmount <= 10000) {
    recommendations.push("Target Anda sangat realistis! Konsisten menabung adalah kunci sukses.");
  } else if (dailyAmount <= 25000) {
    recommendations.push("Target cukup menantang. Pertimbangkan untuk mengurangi pengeluaran non-esensial.");
  } else {
    recommendations.push("Target sangat ambisius. Pertimbangkan untuk memperpanjang deadline atau mengurangi target.");
  }

  if (monthlyAmount > 500000) {
    recommendations.push("Pertimbangkan untuk mencari sumber pendapatan tambahan.");
  }

  recommendations.push("Gunakan aplikasi untuk tracking progress harian.");
  recommendations.push("Set up automatic transfer ke rekening tabungan.");

  return recommendations;
}