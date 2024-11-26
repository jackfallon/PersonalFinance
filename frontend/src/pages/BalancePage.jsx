import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';


export const BalancePage = () => {
  const [balanceData, setBalanceData] = useState({
    currentBalance: 0,
    lastUpdated: null,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBalanceData();
    // Refresh balance data every minute
    const interval = setInterval(fetchBalanceData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchBalanceData = async () => {
    try {
      const [balanceResponse, transactionsResponse] = await Promise.all([
        fetch('http://localhost:5454/api/balance', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        }),
        fetch('http://localhost:5454/api/balance/transactions', {  // Updated endpoint
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        })
      ]);
  
      if (!balanceResponse.ok || !transactionsResponse.ok) {
        throw new Error('Failed to fetch balance data');
      }
  
      const balance = await balanceResponse.json();
      const transactions = await transactionsResponse.json();
  
      setBalanceData({
        currentBalance: balance.currentBalance,
        lastUpdated: balance.lastUpdated,
        recentTransactions: transactions
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Balance Overview</h1>

      {/* Current Balance Card */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">Current Balance</CardTitle>
          <Wallet className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            ${balanceData.currentBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {formatDate(balanceData.lastUpdated)}
          </p>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balanceData.recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {transaction.type === 'EXPENSE' ? (
                        <>
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                          <span>Expense</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                          <span>Income</span>
                        </>
                      )}
                    </TableCell>
                    <TableCell className={
                      transaction.type === 'EXPENSE' ? 'text-red-500' : 'text-green-500'
                    }>
                      {transaction.type === 'EXPENSE' ? '-' : '+'}
                      ${transaction.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
