import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlusCircle, Save } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Housing',
  'Transportation',
  'Food',
  'Utilities',
  'Healthcare',
  'Insurance',
  'Entertainment',
  'Shopping',
  'Savings',
  'Other'
];

export const BudgetFormModal = ({ existingBudget = null, onSave, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(existingBudget || {
    category: '',
    amount: '',
    budgetMonth: new Date().toISOString().slice(0, 7)
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate form data
      if (!formData.category || !formData.amount || !formData.budgetMonth) {
        throw new Error('Please fill in all fields');
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Prepare the budget data
      const budgetData = {
        ...formData,
        amount: amount
      };

      // Determine if we're creating or updating
      const url = formData.id 
        ? `/api/budgets/${formData.id}`
        : '/api/budgets';
      
      const response = await fetch(url, {
        method: formData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        throw new Error('Failed to save budget');
      }

      const savedBudget = await response.json();
      onSave(savedBudget);
      setIsOpen(false);
      setFormData({
        category: '',
        amount: '',
        budgetMonth: new Date().toISOString().slice(0, 7)
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="flex items-center gap-2" 
          variant={existingBudget ? "outline" : "default"}
        >
          {existingBudget ? (
            "Edit Budget"
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              New Budget
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {existingBudget ? 'Edit Budget' : 'Create New Budget'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                $
              </span>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="pl-6"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetMonth">Month</Label>
            <Input
              id="budgetMonth"
              type="month"
              value={formData.budgetMonth}
              onChange={(e) => handleChange('budgetMonth', e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Budget'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};