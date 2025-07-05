import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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

interface SimpleFinancialChartsProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function SimpleFinancialCharts({ transactions, categories }: SimpleFinancialChartsProps) {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Calculate monthly data
  const monthlyData = transactions.reduce((acc: any[], transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const amount = parseFloat(transaction.amount);
    
    let monthData = acc.find(item => item.month === monthKey);
    if (!monthData) {
      monthData = { month: monthKey, income: 0, expense: 0, net: 0 };
      acc.push(monthData);
    }
    
    if (transaction.type === 'income') {
      monthData.income += amount;
    } else {
      monthData.expense += amount;
    }
    monthData.net = monthData.income - monthData.expense;
    
    return acc;
  }, []).sort((a, b) => a.month.localeCompare(b.month));

  // Calculate category data for expenses only
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any[], transaction) => {
      const category = categories.find(cat => cat.id === transaction.categoryId);
      const categoryName = category?.name || 'Lainnya';
      const amount = parseFloat(transaction.amount);
      
      let categoryItem = acc.find(item => item.name === categoryName);
      if (!categoryItem) {
        categoryItem = { 
          name: categoryName, 
          amount: 0, 
          color: category?.color || '#8884d8' 
        };
        acc.push(categoryItem);
      }
      categoryItem.amount += amount;
      
      return acc;
    }, []).sort((a, b) => b.amount - a.amount);

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

  const formatShort = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
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
            <div className={`${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold`}>
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold`}>
              {formatCurrency(totalExpense)}
            </div>
          </CardContent>
        </Card>
        
        <Card className={`bg-gradient-to-r ${netBalance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo Bersih</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold`}>
              {formatCurrency(netBalance)}
            </div>
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
                  tickFormatter={formatShort}
                />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  labelFormatter={(label) => {
                    const [year, month] = label.split('-');
                    return `${month}/${year}`;
                  }}
                />
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
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => 
                    isMobile ? `${(percent * 100).toFixed(0)}%` : `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={isMobile ? 70 : 80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Perbandingan Bulanan</CardTitle>
            <CardDescription>Pemasukan vs pengeluaran per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <BarChart data={monthlyData.slice(-6)}>
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
                  tickFormatter={formatShort}
                />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  labelFormatter={(label) => {
                    const [year, month] = label.split('-');
                    return `${month}/${year}`;
                  }}
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Pemasukan" />
                <Bar dataKey="expense" fill="#ef4444" name="Pengeluaran" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}