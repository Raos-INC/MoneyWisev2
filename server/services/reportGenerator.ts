import { storage } from "../storage";

export async function generateReport(
  userId: string,
  reportType: string,
  periodStart: string,
  periodEnd: string
) {
  try {
    // Get data for the specified period
    const transactions = await storage.getTransactionsByDateRangeWithCategory(userId, periodStart, periodEnd);
    const summary = await storage.getTransactionSummary(userId, periodStart, periodEnd);
    const categories = await storage.getCategories(userId);
    const savingsGoals = await storage.getSavingsGoals(userId);
    const budgets = await storage.getBudgets(userId);

    // Categorize transactions
    const transactionsByCategory = transactions.reduce((acc, transaction) => {
      const categoryId = transaction.categoryId;
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(transaction);
      return acc;
    }, {} as Record<number, typeof transactions>);

    // Calculate category totals
    const categoryTotals = categories.map(category => {
      const categoryTransactions = transactionsByCategory[category.id] || [];
      const total = categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      return {
        ...category,
        total,
        transactionCount: categoryTransactions.length,
        transactions: categoryTransactions
      };
    });

    // Calculate budget usage
    const budgetAnalysis = await Promise.all(
      budgets.map(async (budget) => {
        const usage = await storage.getBudgetUsage(userId, budget.categoryId, budget.period);
        const usagePercentage = (usage / parseFloat(budget.amount)) * 100;
        
        return {
          ...budget,
          usage,
          usagePercentage,
          isOverBudget: usagePercentage > 80, // Default 80% threshold
          remainingBudget: Math.max(0, parseFloat(budget.amount) - usage)
        };
      })
    );

    // Analyze savings goals progress
    const savingsAnalysis = savingsGoals.map(goal => {
      const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
      const remainingAmount = parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount);
      
      // Calculate required monthly savings
      const targetDate = new Date(goal.targetDate);
      const now = new Date();
      const monthsRemaining = Math.max(1, 
        (targetDate.getFullYear() - now.getFullYear()) * 12 + 
        (targetDate.getMonth() - now.getMonth())
      );
      const requiredMonthlySavings = remainingAmount / monthsRemaining;

      return {
        ...goal,
        progress,
        remainingAmount,
        monthsRemaining,
        requiredMonthlySavings,
        isOnTrack: progress >= (100 - (monthsRemaining / 12) * 100)
      };
    });

    // Generate insights
    const insights = {
      totalBalance: summary.totalIncome - summary.totalExpenses,
      savingsRate: summary.totalIncome > 0 ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100 : 0,
      topExpenseCategory: categoryTotals
        .filter(c => c.type === 'expense')
        .sort((a, b) => b.total - a.total)[0],
      budgetAlerts: budgetAnalysis.filter(b => b.isOverBudget),
      savingsGoalsBehind: savingsAnalysis.filter(s => !s.isOnTrack),
    };

    return {
      summary,
      transactions,
      categoryTotals,
      budgetAnalysis,
      savingsAnalysis,
      insights,
      metadata: {
        periodStart,
        periodEnd,
        reportType,
        generatedAt: new Date().toISOString(),
        totalTransactions: transactions.length
      }
    };

  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error("Failed to generate report");
  }
}
