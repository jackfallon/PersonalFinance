import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BudgetFormModal } from '@/components/modal/BudgetFormModal';


export const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBudgetData();
  }, [currentMonth]);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const [budgetsResponse, summaryResponse] = await Promise.all([
        fetch(`http://localhost:5454/api/budgets/month/${currentMonth}`),
        fetch(`http://localhost:5454/api/budgets/summary/${currentMonth}`)
      ]);

      if (!budgetsResponse.ok || !summaryResponse.ok) {
        throw new Error('Failed to fetch budget data');
      }

      const budgetsData = await budgetsResponse.json();
      const summaryData = await summaryResponse.json();

      setBudgets(budgetsData);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudget = async (savedBudget) => {
    await fetchBudgetData(); // Refresh the budget data
  };

  const handleDeleteBudget = async (budgetId) => {
    try {
      const response = await fetch(`http://localhost:5454/api/budgets/${budgetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }

      await fetchBudgetData(); // Refresh the budget data
    } catch (err) {
      setError(err.message);
    }
  };

  const calculateProgress = (category) => {
    if (!summary) return 0;
    const budgetAmount = summary.budgets[category] || 0;
    const spentAmount = summary.spent[category] || 0;
    return Math.min((spentAmount / budgetAmount) * 100, 100);
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'bg-red-500';
    if (progress >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Budget Management</h1>
        <div className="flex items-center gap-4">
          <Input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="w-40"
          />
          <BudgetFormModal onSave={handleSaveBudget} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((budget) => (
          <Card key={budget.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{budget.category}</h3>
                <div className="flex items-center gap-2">
                  <BudgetFormModal 
                    existingBudget={budget} 
                    onSave={handleSaveBudget}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteBudget(budget.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                ${summary?.spent[budget.category] || 0} / ${budget.amount}
              </span>
            </CardHeader>
            <CardContent>
              <Progress 
                value={calculateProgress(budget.category)}
                className={`h-2 ${getProgressColor(calculateProgress(budget.category))}`}
              />
              {calculateProgress(budget.category) >= 90 && (
                <Alert className="mt-2">
                  <AlertDescription>
                    You're over or close to exceeding your budget!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
