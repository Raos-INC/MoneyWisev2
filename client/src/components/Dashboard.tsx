import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SimpleFinancialCharts from "@/components/SimpleFinancialCharts";
import { useMediaQuery } from "react-responsive";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  PiggyBank,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Plus,
  Lightbulb,
  Calendar,
  Wallet,
  BarChart3,
  Award,
  Zap,
  Star,
  Gift,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Heart,
  GraduationCap,
  Gamepad2,
  Smartphone,
  TrendingUpIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { id } from "date-fns/locale";

interface Transaction {
  id: number;
  amount: string;
  description: string;
  type: "income" | "expense";
  categoryId: number;
  date: string;
  category?: {
    name: string;
    icon: string;
    color: string;
  };
}

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
}

interface SavingsGoal {
  id: number;
  title: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
  description?: string;
}

interface AiInsight {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  actionable: boolean;
  isRead: boolean;
  createdAt: string;
}

interface FinancialSummary {
  monthlyIncome: number;
  monthlyExpenses: number;
  netBalance: number;
  savingsGoals: number;
  totalSavingsTarget: number;
  totalCurrentSavings: number;
}

export default function Dashboard() {
  const [showBalances, setShowBalances] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });

  // Fetch user data
  const { data: user } = useQuery<{ id: number; email: string; name: string }>({
    queryKey: ["/api/auth/user"],
  });

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<
    Transaction[]
  >({
    queryKey: ["/api/transactions"],
  });

  // Initialize user data mutation
  const initializeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/initialize", "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch savings goals
  const { data: savingsGoals = [], isLoading: savingsLoading } = useQuery<
    SavingsGoal[]
  >({
    queryKey: ["/api/savings-goals"],
  });

  // Fetch AI insights
  const { data: aiInsights = [], isLoading: insightsLoading } = useQuery<
    AiInsight[]
  >({
    queryKey: ["/api/ai-insights"],
  });

  // Fetch financial summary
  const { data: financialSummary, isLoading: summaryLoading } =
    useQuery<FinancialSummary>({
      queryKey: ["/api/user/financial-summary"],
    });

  // Force initialize categories mutation
  const forceInitMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/categories/force-init", "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
  });

  // Auto-initialize categories if empty
  useEffect(() => {
    if (
      categories &&
      categories.length === 0 &&
      !initializeMutation.isPending
    ) {
      initializeMutation.mutate();
    }
  }, [categories, initializeMutation]);

  // Generate AI insights mutation
  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/ai-insights/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = "/";
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        console.error('Generate insights error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-insights'] });
      toast({
        title: "✨ Wawasan AI Diperbarui",
        description: `${data.count || 0} insight baru berhasil dihasilkan`,
      });
    },
    onError: (error: any) => {
      console.error('Generate insights mutation error:', error);
      toast({
        title: "Error Generating Insights",
        description: error.message || "Gagal menghasilkan wawasan AI. Periksa koneksi internet dan coba lagi.",
        variant: "destructive",
      });
    },
  });

  // Calculate period-based data
  const getPeriodData = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (selectedPeriod) {
      case "thisMonth":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case "last3Months":
        startDate = subMonths(startOfMonth(now), 2);
        endDate = endOfMonth(now);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    const periodTransactions = transactions.filter((t: Transaction) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    const income = periodTransactions
      .filter((t: Transaction) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expenses = periodTransactions
      .filter((t: Transaction) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      transactions: periodTransactions,
    };
  };

  const {
    income,
    expenses,
    balance,
    transactions: periodTransactions,
  } = getPeriodData();

  // Calculate category spending
  const getCategorySpending = () => {
    console.log('Calculating category spending for transactions:', periodTransactions);
    console.log('Available categories:', categories);

    const categorySpending = periodTransactions
      .filter((t: Transaction) => t.type === "expense")
      .reduce(
        (acc, t) => {
          // Find the actual category from categories array
          const categoryFromList = categories.find(cat => cat.id === t.categoryId);
          const categoryName = categoryFromList?.name || t.category?.name || "Lainnya";
          const categoryColor = categoryFromList?.color || t.category?.color || "#6B7280";
          const categoryIcon = categoryFromList?.icon || t.category?.icon || "fas fa-ellipsis-h";

          console.log(`Transaction ${t.id}: categoryId=${t.categoryId}, found category:`, categoryFromList);

          if (!acc[categoryName]) {
            acc[categoryName] = {
              amount: 0,
              color: categoryColor,
              icon: categoryIcon,
              count: 0,
            };
          }
          acc[categoryName].amount += parseFloat(t.amount);
          acc[categoryName].count += 1;
          return acc;
        },
        {} as Record<
          string,
          { amount: number; color: string; icon: string; count: number }
        >,
      );

    console.log('Final category spending:', categorySpending);

    return Object.entries(categorySpending)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const topCategories = getCategorySpending();

  // Recent transactions (last 5)
  const recentTransactions = transactions
    .sort(
      (a: Transaction, b: Transaction) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}jt`;
    } else if (amount >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)}rb`;
    }
    return formatCurrency(amount);
  };

  const getIconComponent = (iconString: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      "fas fa-briefcase": Wallet,
      "fas fa-gift": Gift,
      "fas fa-chart-line": TrendingUpIcon,
      "fas fa-laptop": Smartphone,
      "fas fa-plus": Plus,
      "fas fa-utensils": Coffee,
      "fas fa-car": Car,
      "fas fa-gamepad": Gamepad2,
      "fas fa-heart": Heart,
      "fas fa-shopping-bag": ShoppingBag,
      "fas fa-file-invoice": CreditCard,
      "fas fa-graduation-cap": GraduationCap,
      "fas fa-ellipsis-h": Plus,
      "fas fa-home": Home,
    };

    return iconMap[iconString] || Plus;
  };

  if (transactionsLoading || savingsLoading || summaryLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Enhanced Welcome Section */}
      <div className="bg-gradient-to-r from-[#8BD3E6] via-[#7BC5D8] to-[#6AB7CA] rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                <PiggyBank className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Selamat datang kembali{user?.name ? `, ${user.name}` : ""}! 👋
                </h1>
                <p className="text-white/80 text-lg">
                  Mari kelola keuangan Anda dengan bijak
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-green-300 mr-2" />
                  <span className="text-sm font-medium text-white/80">
                    Pendapatan Bulan Ini
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {showBalances ? formatCurrency(income) : "••••••••"}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <TrendingDown className="h-5 w-5 text-red-300 mr-2" />
                  <span className="text-sm font-medium text-white/80">
                    Pengeluaran Bulan Ini
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {showBalances ? formatCurrency(expenses) : "••••••••"}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Wallet className="h-5 w-5 text-blue-300 mr-2" />
                  <span className="text-sm font-medium text-white/80">
                    Saldo Bersih
                  </span>
                </div>
                <p
                  className={`text-2xl font-bold ${balance >= 0 ? "text-green-300" : "text-red-300"}`}
                >
                  {showBalances ? formatCurrency(balance) : "••••••••"}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalances(!showBalances)}
              className="text-white hover:bg-white/20 mb-4"
            >
              {showBalances ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Financial Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-[#8BD3E6]/10 to-[#7BC5D8]/10 border-[#8BD3E6]/30 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#8BD3E6]">
              Total Pendapatan
            </CardTitle>
            <div className="w-10 h-10 bg-[#8BD3E6]/20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-[#8BD3E6]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#8BD3E6] mb-1">
              {showBalances ? formatCurrency(income) : "••••••••"}
            </div>
            <p className="text-xs text-[#8BD3E6]/80 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">
              Total Pengeluaran
            </CardTitle>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800 mb-1">
              {showBalances ? formatCurrency(expenses) : "••••••••"}
            </div>
            <p className="text-xs text-red-600 flex items-center">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              +5% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Saldo Bersih
            </CardTitle>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold mb-1 ${balance >= 0 ? "text-blue-800" : "text-red-800"}`}
            >
              {showBalances ? formatCurrency(balance) : "••••••••"}
            </div>
            <p
              className={`text-xs flex items-center ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}
            >
              {balance >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Surplus
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  Defisit
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Target Tabungan
            </CardTitle>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 mb-1">
              {savingsGoals.length}
            </div>
            <p className="text-xs text-purple-600">Target aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                <Lightbulb className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-amber-800">
                  Wawasan AI Real-time
                </CardTitle>
                <p className="text-sm text-amber-600 mt-1">
                  Analisis otomatis berdasarkan pemasukan:{" "}
                  {formatCurrency(income)}, pengeluaran:{" "}
                  {formatCurrency(expenses)}, saldo: {formatCurrency(balance)}
                </p>
              </div>
            </div>
            <Button
              onClick={() => generateInsightsMutation.mutate()}
              disabled={generateInsightsMutation.isPending}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              {generateInsightsMutation.isPending
                ? "Menganalisis..."
                : "Generate Baru"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {insightsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-4 border border-amber-200 animate-pulse"
                >
                  <div className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 mr-3"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-full"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : aiInsights.length > 0 ? (
            <div className="space-y-3">
              {aiInsights.slice(0, 3).map((insight: AiInsight) => (
                <div
                  key={insight.id}
                  className="bg-white rounded-lg p-4 border border-amber-200"
                >
                  <div className="flex items-start">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                        insight.priority === "high"
                          ? "bg-red-500"
                          : insight.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-gray-600">{insight.message}</p>
                      <div className="flex items-center mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {insight.type}
                        </Badge>
                        {insight.actionable && (
                          <Badge variant="outline" className="text-xs ml-2">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Actionable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-amber-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-amber-800 mb-2">
                Belum Ada Wawasan AI
              </h3>
              <p className="text-amber-600 mb-4">
                Generate wawasan finansial pertama Anda berdasarkan pola
                transaksi
              </p>
              <Button
                onClick={() => generateInsightsMutation.mutate()}
                disabled={
                  generateInsightsMutation.isPending ||
                  transactions.length === 0
                }
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Zap className="h-4 w-4 mr-2" />
                {generateInsightsMutation.isPending
                  ? "Menganalisis..."
                  : "Generate Wawasan AI"}
              </Button>
              {transactions.length === 0 && (
                <p className="text-xs text-amber-500 mt-2">
                  Tambahkan beberapa transaksi terlebih dahulu untuk mendapatkan
                  wawasan AI
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-600" />
              Aksi Cepat
            </CardTitle>
            {categories.length === 0 && (
              <Button
                onClick={() => forceInitMutation.mutate()}
                disabled={forceInitMutation.isPending}
                size="sm"
                variant="outline"
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                {forceInitMutation.isPending ? "Membuat..." : "Buat Kategori"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 hover:bg-blue-50"
              onClick={() => {
                // Navigate to transactions page
                if (window.location.pathname !== "/transactions") {
                  window.location.href = "/transactions";
                } else {
                  // If already on transactions page, trigger add modal
                  const event = new CustomEvent("openAddTransactionModal");
                  window.dispatchEvent(event);
                }
              }}
            >
              <Plus className="h-6 w-6 text-blue-600" />
              <span className="text-sm">Tambah Transaksi</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 hover:bg-green-50"
              onClick={() => (window.location.href = "/savings")}
            >
              <Target className="h-6 w-6 text-green-600" />
              <span className="text-sm">Target Tabungan</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 hover:bg-purple-50"
              onClick={() => (window.location.href = "/reports")}
            >
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <span className="text-sm">Lihat Laporan</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 hover:bg-orange-50"
              onClick={() => (window.location.href = "/insights")}
            >
              <Award className="h-6 w-6 text-orange-600" />
              <span className="text-sm">Financial Insights</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-600" />
                Transaksi Terbaru
              </CardTitle>
              <Button variant="ghost" size="sm">
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction: Transaction) => {
                  const IconComponent = getIconComponent(
                    transaction.category?.icon || "fas fa-ellipsis-h",
                  );
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                          style={{
                            backgroundColor: `${transaction.category?.color}20`,
                          }}
                        >
                          <IconComponent
                            className="h-5 w-5"
                            style={{ color: transaction.category?.color }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.category?.name} •{" "}
                            {format(new Date(transaction.date), "dd MMM yyyy", {
                              locale: id,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCompactCurrency(
                            parseFloat(transaction.amount),
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Belum ada transaksi</p>
                  <Button variant="link" className="mt-2">
                    Tambah transaksi pertama
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-gray-600" />
              Kategori Teratas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.length > 0 ? (
                topCategories.map((category, index) => {
                  const IconComponent = getIconComponent(category.icon);
                  const percentage =
                    expenses > 0 ? (category.amount / expenses) * 100 : 0;
                  return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex items-center mr-3">
                            <span className="text-sm font-bold text-gray-400 mr-2">
                              #{index + 1}
                            </span>
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                              style={{ backgroundColor: `${category.color}20` }}
                            >
                              <IconComponent
                                className="h-4 w-4"
                                style={{ color: category.color }}
                              />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {category.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {category.count} transaksi
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCompactCurrency(category.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <Progress
                        value={percentage}
                        className="h-2"
                        style={
                          {
                            "--progress-background": category.color + "20",
                            "--progress-foreground": category.color,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Belum ada data kategori</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals */}
      {savingsGoals.length > 0 && (
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Target Tabungan Aktif
              </CardTitle>
              <Badge variant="secondary">{savingsGoals.length} target</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {savingsGoals.slice(0, 4).map((goal: SavingsGoal) => {
                const progress =
                  (parseFloat(goal.currentAmount) /
                    parseFloat(goal.targetAmount)) *
                  100;
                const remaining =
                  parseFloat(goal.targetAmount) -
                  parseFloat(goal.currentAmount);
                const isCompleted = progress >= 100;

                return (
                  <div
                    key={goal.id}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-blue-900">
                        {goal.title}
                      </h4>
                      {isCompleted && (
                        <Badge className="bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          Selesai
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justifybetween text-sm">
                        <span className="text-gray-600">
                          {formatCurrency(parseFloat(goal.currentAmount))} /{" "}
                          {formatCurrency(parseFloat(goal.targetAmount))}
                        </span>
                        <span className="font-medium text-blue-600">
                          {progress.toFixed(1)}%
                        </span>
                      </div>

                      <Progress
                        value={Math.min(progress, 100)}
                        className="h-3"
                      />

                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                          Target:{" "}
                          {format(new Date(goal.targetDate), "dd MMM yyyy", {
                            locale: id,
                          })}
                        </span>
                        {!isCompleted && (
                          <span className="text-orange-600 font-medium">
                            Sisa: {formatCompactCurrency(remaining)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Charts Section */}
      <Card className="bg-gradient-to-br from-[#feecc8]/30 to-[#8BD3E6]/10 border-[#8BD3E6]/20">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-[#8BD3E6]" />
                Analisis Keuangan Komprehensif
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Visualisasi lengkap pemasukan, pengeluaran, dan perbandingan
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-[#8BD3E6]/20 text-[#8BD3E6]">
                <TrendingUp className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <SimpleFinancialCharts transactions={transactions} categories={categories} />
          
          {/* Additional Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-gradient-to-br from-[#8BD3E6]/10 to-[#7BC5D8]/10 border-[#8BD3E6]/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#8BD3E6]">Rasio Tabungan</p>
                    <p className="text-2xl font-bold text-[#8BD3E6]">
                      {income > 0 ? ((balance / income) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <PiggyBank className="h-8 w-8 text-[#8BD3E6]" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-[#feecc8]/30 to-[#8BD3E6]/10 border-[#8BD3E6]/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#8BD3E6]">Avg. Harian</p>
                    <p className="text-2xl font-bold text-[#8BD3E6]">
                      {formatCurrency(expenses / 30)}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-[#8BD3E6]" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-[#8BD3E6]/10 to-[#7BC5D8]/10 border-[#8BD3E6]/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#8BD3E6]">Transaksi</p>
                    <p className="text-2xl font-bold text-[#8BD3E6]">
                      {transactions.length}
                    </p>
                  </div>
                  <TrendingUpIcon className="h-8 w-8 text-[#8BD3E6]" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}