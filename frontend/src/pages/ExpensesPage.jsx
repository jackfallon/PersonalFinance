import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, Edit2 } from 'lucide-react';



export const ExpensesPage = () => {
    const [expenses, setExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({
      category: '',
      amount: '',
      frequency: 'ONE_TIME',
      start: '',
      end: ''
    });
    const [editingExpense, setEditingExpense] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      fetchExpenses();
    }, []);
  
    const fetchExpenses = async () => {
      try {
        const response = await fetch('http://localhost:5454/api/expenses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch expenses');
        const data = await response.json();
        setExpenses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const handleDelete = async (id) => {
      if (!window.confirm('Are you sure you want to delete this expense?')) {
          return;
      }

      try {
          const response = await fetch(`http://localhost:5454/api/expenses/${id}`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${localStorage.getItem('jwt')}`
              }
          });

          if (!response.ok) {
              throw new Error('Failed to delete expense');
          }

          // Remove the expense from the local state
          setExpenses(expenses.filter(expense => expense.id !== id));
      } catch (err) {
          setError(err.message);
      }
  };

  const handleEdit = (id) => {
    const expenseToEdit = expenses.find(expense => expense.id === id);
    if (expenseToEdit) {
        setEditingExpense({
            id: expenseToEdit.id,
            category: expenseToEdit.category,
            amount: expenseToEdit.amount,
            frequency: expenseToEdit.frequency
        });
        setIsEditDialogOpen(true);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`http://localhost:5454/api/expenses/${editingExpense.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            },
            body: JSON.stringify(editingExpense)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update expense');
        }

        // Refresh the expenses list
        await fetchExpenses();
        setIsEditDialogOpen(false);
        setEditingExpense(null);
    } catch (err) {
        setError(err.message);
    }
  };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const expenseData = {
          ...newExpense,
          startDate: new Date().toISOString(),
          user: null
        };

        const response = await fetch('http://localhost:5454/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          },
          body: JSON.stringify(expenseData)
        });
        if (!response.ok){
          const errorData = await response.json();
          throw new Error(errorData.message ||'Failed to create expense');
        }
        fetchExpenses();
        setNewExpense({ category: '', amount: '', frequency: 'ONE_TIME', start: '', end: '' });
      } catch (err) {
        setError(err.message);
      }
    };
  
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Expenses</h1>
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                <PlusCircle size={20} />
                Add Expense
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Category"
                  className="w-full p-2 border rounded"
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-full p-2 border rounded"
                  value={newExpense.amount}
                  onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                />
                <select
                  className="w-full p-2 border rounded"
                  value={newExpense.frequency}
                  onChange={e => setNewExpense({...newExpense, frequency: e.target.value})}
                >
                  <option value="ONE_TIME">One Time</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
                  Add Expense
                </button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Category"
                  className="w-full p-2 border rounded"
                  value={editingExpense?.category || ''}
                  onChange={e => setEditingExpense({
                    ...editingExpense,
                    category: e.target.value
                  })}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-full p-2 border rounded"
                  value={editingExpense?.amount || ''}
                  onChange={e => setEditingExpense({
                    ...editingExpense,
                    amount: e.target.value
                  })}
                />
                <select
                  className="w-full p-2 border rounded"
                  value={editingExpense?.frequency || 'ONE_TIME'}
                  onChange={e => setEditingExpense({
                    ...editingExpense,
                    frequency: e.target.value
                  })}
                >
                  <option value="ONE_TIME">One Time</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
                  Update Expense
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
  
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
  
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ minWidth: '125px', padding: '12px 24px' }}>Category</TableHead>
              <TableHead style={{ minWidth: '125px', padding: '12px 24px' }}>Amount</TableHead>
              <TableHead style={{ minWidth: '125px', padding: '12px 24px' }}>Frequency</TableHead>
              <TableHead style={{ minWidth: '125px', padding: '12px 24px' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map(expense => (
              <TableRow key={expense.id}>
                <TableCell>{expense.category}</TableCell>
                <TableCell>${expense.amount}</TableCell>
                <TableCell>{expense.frequency.toLowerCase()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(expense.id)} className="text-blue-600 hover:text-blue-800">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(expense.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };