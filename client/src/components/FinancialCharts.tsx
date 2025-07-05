import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMediaQuery } from 'react-responsive';

interface Transaction {
  id: number;
  amount: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
  color: string;
  type: 'income' | 'expense';
}

interface FinancialChartsProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function FinancialCharts({ transactions, categories }: FinancialChartsProps) {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  
  // Process data for charts
  const processMonthlyData = () => {
    const monthlyData: Record<string, { month: string; income: number; expense: number; net: number }> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const amount = parseFloat(transaction.amount);
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          income: 0,
          expense: 0,
          net: 0
        };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += amount;
      } else {
        monthlyData[monthKey].expense += amount;
      }
      
      monthlyData[monthKey].net = monthlyData[monthKey].income - monthlyData[monthKey].expense;
    });
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  const processCategoryData = () => {
    const categoryData: Record<string, { name: string; amount: number; color: string }> = {};
    
    transactions.forEach(transaction => {
      const category = categories.find(cat => cat.id === transaction.categoryId);
      const categoryName = category?.name || 'Lainnya';
      const amount = parseFloat(transaction.amount);
      
      if (!categoryData[categoryName]) {
        categoryData[categoryName] = {
          name: categoryName,
          amount: 0,
          color: category?.color || '#8884d8'
        };
      }
      
      categoryData[categoryName].amount += amount;
    });
    
    return Object.values(categoryData).sort((a, b) => b.amount - a.amount);
  };

  const processWeeklyTrend = () => {
    const weeklyData: Record<string, { week: string; income: number; expense: number }> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      const amount = parseFloat(transaction.amount);
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          income: 0,
          expense: 0
        };
      }
      
      if (transaction.type === 'income') {
        weeklyData[weekKey].income += amount;
      } else {
        weeklyData[weekKey].expense += amount;
      }
    });
    
    return Object.values(weeklyData).sort((a, b) => a.week.localeCompare(b.week)).slice(-8);
  };

  const monthlyData = processMonthlyData();
  const categoryData = processCategoryData();
  const weeklyData = processWeeklyTrend();

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
  const netBalance = totalIncome - totalExpense;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{formatCurrency(totalExpense)}</div>
          </CardContent>
        </Card>
        
        <Card className={`bg-gradient-to-r ${netBalance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo Bersih</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{formatCurrency(netBalance)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Trend Chart */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Tren Keuangan Bulanan</CardTitle>
            <CardDescription>Pemasukan, pengeluaran, dan saldo bersih per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  fontSize={isMobile ? 10 : 12}
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-');
                    return `${month}/${year.slice(-2)}`;
                  }}
                />
                <YAxis 
                  fontSize={isMobile ? 10 : 12}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" name="Pemasukan" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Pengeluaran" strokeWidth={2} />
                <Line type="monotone" dataKey="net" stroke="#3b82f6" name="Saldo Bersih" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Pengeluaran per Kategori</CardTitle>
            <CardDescription>Distribusi pengeluaran berdasarkan kategori</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <PieChart>
                <Pie
                  data={categoryData.filter(cat => cat.amount > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => isMobile ? `${(percent * 100).toFixed(0)}%` : `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={isMobile ? 70 : 80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Tren Mingguan</CardTitle>
            <CardDescription>Pemasukan vs pengeluaran 8 minggu terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="week" 
                  fontSize={isMobile ? 10 : 12}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis 
                  fontSize={isMobile ? 10 : 12}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Pemasukan" />
                <Bar dataKey="expense" fill="#ef4444" name="Pengeluaran" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Area Keuangan</CardTitle>
          <CardDescription>Visualisasi area pemasukan dan pengeluaran</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={isMobile ? 250 : 350}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                fontSize={isMobile ? 10 : 12}
                tickFormatter={(value) => {
                  const [year, month] = value.split('-');
                  return `${month}/${year.slice(-2)}`;
                }}
              />
              <YAxis 
                fontSize={isMobile ? 10 : 12}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="income" 
                stackId="1" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6}
                name="Pemasukan"
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                stackId="2" 
                stroke="#ef4444" 
                fill="#ef4444" 
                fillOpacity={0.6}
                name="Pengeluaran"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}