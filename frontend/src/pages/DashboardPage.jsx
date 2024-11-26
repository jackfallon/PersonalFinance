import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Alert, AlertDescription} from "@/components/ui/alert"
import { AuthenticatedLayout } from '@/components/layout/AuthLayout';


const DashboardCard = ({ title, value, subValue, icon: Icon, trend, onClick }) => (
  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subValue && (
        <div className="flex items-center text-sm text-muted-foreground">
          {trend === 'up' ? (
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
          )}
          {subValue}
        </div>
      )}
    </CardContent>
  </Card>
);

const RecentTransactionsCard = ({ transactions }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle>Recent Transactions</CardTitle>
      <CardDescription>Your latest financial activities</CardDescription>
    </CardHeader>
    <CardContent>
      {transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((transaction, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {transaction.type === 'expense' ? (
                  <CreditCard className="h-6 w-6 text-red-500" />
                ) : (
                  <DollarSign className="h-6 w-6 text-green-500" />
                )}
                <div>
                  <p className="text-sm font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">{transaction.date}</p>
                </div>
              </div>
              <div className={`text-sm font-medium ${
                transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'
              }`}>
                {transaction.type === 'expense' ? '-' : '+'}${transaction.amount}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No recent transactions
        </div>
      )}
    </CardContent>
  </Card>
);

const SpendingTrendChart = ({ spendingData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Trend</CardTitle>
        <CardDescription>Your spending pattern over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#8884d8" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const ExpenseBreakdownChart = ({ expenses }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>Distribution of your expenses by category</CardDescription>
      </CardHeader>
      <CardContent>
      <div style={{ width: '100%', height: 300, }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={expenses}
                dataKey="value"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {expenses.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    portfolioValue: 0,
    portfolioChange: 0,
    recentTransactions: [],
    expenseBreakdown: [],
    spendingTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [balanceRes, expensesRes, incomeRes, portfolioRes, transactionsRes] = await Promise.all([
        fetch('http://localhost:5454/api/balance', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        }),
        fetch('http://localhost:5454/api/dashboard/expenses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        }),
        fetch('http://localhost:5454/api/dashboard/income', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        }),
        fetch('http://localhost:5454/api/portfolio', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        }),
        fetch('http://localhost:5454/api/dashboard/transactions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        })
      ]);

      const [balance, expenses, income, portfolio, transactions] = await Promise.all([
        balanceRes.json(),
        expensesRes.json(),
        incomeRes.json(),
        portfolioRes.json(),
        transactionsRes.json()
      ]);

      setDashboardData({
        totalBalance: balance.total,
        monthlyIncome: income.monthly,
        monthlyExpenses: expenses.monthly,
        portfolioValue: portfolio.totalValue,
        portfolioChange: portfolio.dailyChangePercent,
        recentTransactions: transactions.recent,
        expenseBreakdown: expenses.breakdown,
        spendingTrend: expenses.trend
      });
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh dashboard data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const styles = {
    container: {
      padding: '24px',
    },
    topRow: {
      display: 'grid',
      gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 
                          window.innerWidth < 1024 ? 'repeat(2, 1fr)' : 
                          'repeat(4, 1fr)',
      gap: '16px',
      marginBottom: '24px',
    },
    middleRow: {
      display: 'grid',
      gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
      gap: '16px',
      marginBottom: '24px',
    },
    bottomRow: {
      marginBottom: '24px',
    },
  };

  return (
    <AuthenticatedLayout title="Dashboard">

      <div style={styles.container} className="container mx-auto p-6">
      <h2 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h2>
      
        {/* Top row: Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4" style = {styles.topRow}>
          <DashboardCard
            title="Total Balance"
            value={`$${(dashboardData.totalBalance || 0).toLocaleString()}`}
            icon={Wallet}
            onClick={() => navigate('/balance')}
          />
          <DashboardCard
            title="Monthly Income"
            value={`$${(dashboardData.monthlyIncome || 0).toLocaleString()}`}
            subValue={dashboardData.totalBalance ? 
              `+${((dashboardData.monthlyIncome / dashboardData.totalBalance) * 100).toFixed(1)}%` : 
              '0%'}
            icon={DollarSign}
            trend="up"
            onClick={() => navigate('/income')}
          />
          <DashboardCard
            title="Monthly Expenses"
            value={`$${(dashboardData.monthlyExpenses || 0).toLocaleString()}`}
            subValue={dashboardData.monthlyIncome ? 
              `${((dashboardData.monthlyExpenses / dashboardData.monthlyIncome) * 100).toFixed(1)}% of income` : 
              '0% of income'}
            icon={CreditCard}
            trend="down"
            onClick={() => navigate('/expenses')}
          />
          <DashboardCard
            title="Portfolio Value"
            value={`$${(dashboardData.portfolioValue || 0).toLocaleString()}`}
            subValue={`${dashboardData.portfolioChange > 0 ? '+' : ''}${dashboardData.portfolioChange || 0}%`}
            icon={TrendingUp}
            trend={dashboardData.portfolioChange >= 0 ? 'up' : 'down'}
            onClick={() => navigate('/portfolio')}
          />
        </div>

        {/* Middle row: Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" style = {styles.middleRow}>
          <SpendingTrendChart spendingData={dashboardData.spendingTrend || []} />
          <ExpenseBreakdownChart expenses={dashboardData.expenseBreakdown || []} />
        </div>
        
        {/* Bottom row: Recent Transactions */}
        <div className="mb-4" style = {styles.bottomRow}>
          <RecentTransactionsCard transactions={dashboardData.recentTransactions || []} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;