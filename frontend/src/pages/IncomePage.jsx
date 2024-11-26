import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlusCircle, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const IncomePage = () => {
    const [incomes, setIncomes] = useState([]);
    const [newIncome, setNewIncome] = useState({
        type: '',
        amount: '',
        frequency: 'MONTHLY',
    });
    const [editingIncome, setEditingIncome] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchIncomes();
    }, []);

    const fetchIncomes = async () => {
        try {
            const response = await fetch('http://localhost:5454/api/incomes', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch incomes');
            const data = await response.json();
            setIncomes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5454/api/incomes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                },
                body: JSON.stringify({
                    type: newIncome.type,
                    amount: newIncome.amount,
                    frequency: newIncome.frequency
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create income');
            }

            await fetchIncomes();
            setNewIncome({ type: '', amount: '', frequency: 'MONTHLY' });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (id) => {
        const incomeToEdit = incomes.find(income => income.id === id);
        if (incomeToEdit) {
            setEditingIncome({
                id: incomeToEdit.id,
                type: incomeToEdit.type,
                amount: incomeToEdit.amount,
                frequency: incomeToEdit.frequency
            });
            setIsEditDialogOpen(true);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5454/api/incomes/${editingIncome.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                },
                body: JSON.stringify(editingIncome)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update income');
            }

            await fetchIncomes();
            setIsEditDialogOpen(false);
            setEditingIncome(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this income?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5454/api/incomes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete income');
            }

            setIncomes(incomes.filter(income => income.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Income Sources</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                            <PlusCircle size={20} />
                            Add Income
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Income</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Income Source"
                                className="w-full p-2 border rounded"
                                value={newIncome.type}
                                onChange={e => setNewIncome({...newIncome, type: e.target.value})}
                            />
                            <input
                                type="number"
                                placeholder="Amount"
                                className="w-full p-2 border rounded"
                                value={newIncome.amount}
                                onChange={e => setNewIncome({...newIncome, amount: e.target.value})}
                            />
                            <select
                                className="w-full p-2 border rounded"
                                value={newIncome.frequency}
                                onChange={e => setNewIncome({...newIncome, frequency: e.target.value})}
                            >
                                <option value="ONE_TIME">One Time</option>
                                <option value="WEEKLY">Weekly</option>
                                <option value="MONTHLY">Monthly</option>
                                <option value="YEARLY">Yearly</option>
                            </select>
                            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
                                Add Income
                            </button>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Income</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Income Source"
                                className="w-full p-2 border rounded"
                                value={editingIncome?.type || ''}
                                onChange={e => setEditingIncome({
                                    ...editingIncome,
                                    type: e.target.value
                                })}
                            />
                            <input
                                type="number"
                                placeholder="Amount"
                                className="w-full p-2 border rounded"
                                value={editingIncome?.amount || ''}
                                onChange={e => setEditingIncome({
                                    ...editingIncome,
                                    amount: e.target.value
                                })}
                            />
                            <select
                                className="w-full p-2 border rounded"
                                value={editingIncome?.frequency || 'MONTHLY'}
                                onChange={e => setEditingIncome({
                                    ...editingIncome,
                                    frequency: e.target.value
                                })}
                            >
                                <option value="ONE_TIME">One Time</option>
                                <option value="WEEKLY">Weekly</option>
                                <option value="MONTHLY">Monthly</option>
                                <option value="YEARLY">Yearly</option>
                            </select>
                            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
                                Update Income
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
                    <TableHead style={{ minWidth: '125px', padding: '12px 24px' }}>Source</TableHead>
                    <TableHead style={{ minWidth: '125px', padding: '12px 24px' }}>Amount</TableHead>
                    <TableHead style={{ minWidth: '125px', padding: '12px 24px' }}>Frequency</TableHead>
                    <TableHead style={{ minWidth: '125px', padding: '12px 24px' }}>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {incomes.map(income => (
                    <TableRow key={income.id}>
                        <TableCell>{income.type}</TableCell>
                        <TableCell>${income.amount}</TableCell>
                        <TableCell>{income.frequency.toLowerCase()}</TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(income.id)} className="text-blue-600 hover:text-blue-800">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(income.id)} className="text-red-600 hover:text-red-800">
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