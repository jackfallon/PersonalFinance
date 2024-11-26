import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, TrendingUp, Wallet, Edit2, Trash2 } from 'lucide-react';
import { Alert, AlertDescription} from "@/components/ui/alert";


export const PortfolioPage = () => {
    const [portfolio, setPortfolio] = useState({
      totalValue: 0,
      stocks: [],
      dailyChange: 0,
      dailyChangePercent: 0,
    });
    const [newStock, setNewStock] = useState({
      symbol: '',
      shares: ''
    });
    const [editingStock, setEditingStock] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      fetchPortfolio();
    }, []);
  
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5454/api/portfolio', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch portfolio');
        const data = await response.json();
        setPortfolio({ // ensure all values are defined
          totalValue: data.totalValue || 0,
          stocks: data.stocks || [],
          dailyChange: data.dailyChange || 0,
          dailyChangePercent: data.dailyChangePercent || 0
        });
      } catch (err) {
        setError(err.message);
        setPortfolio({
          totalValue: 0,
          stocks: [],
          dailyChange: 0,
          dailyChangePercent: 0
        })
      }
      finally {
        setLoading(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch('http://localhost:5454/api/portfolio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          },
          body: JSON.stringify(newStock)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add stock');
        }

        await fetchPortfolio();
        setNewStock({ symbol: '', shares: '' });
      } catch (err) {
        setError(err.message);
      }
    };

    const handleEdit = (symbol) => {
      const stockToEdit = portfolio.stocks.find(stock => stock.symbol === symbol);
      if (stockToEdit) {
        setEditingStock({
          symbol: stockToEdit.symbol,
          shares: stockToEdit.shares
        });
        setIsEditDialogOpen(true);
      }
    };

    const handleEditSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(`http://localhost:5454/api/portfolio/${editingStock.symbol}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          },
          body: JSON.stringify(editingStock)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update stock');
        }

        await fetchPortfolio();
        setIsEditDialogOpen(false);
        setEditingStock(null);
      } catch (err) {
        setError(err.message);
      }
    };

    const handleDelete = async (symbol) => {
      if (!window.confirm('Are you sure you want to delete this stock?')) {
        return;
      }

      try {
        const response = await fetch(`http://localhost:5454/api/portfolio/${symbol}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete stock');
        }

        await fetchPortfolio();
      } catch (err) {
        setError(err.message);
      }
    };

    if (loading){
      return <div className="p-8">Loading portfolio...</div>
    }

    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Investment Portfolio</h1>
          {/* Dialog for adding new stock */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                <PlusCircle size={20} />
                Add Investment
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                  <DialogTitle>Add New Stock</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Stock Symbol (e.g., AAPL)"
                    className="w-full p-2 border rounded"
                    value={newStock.symbol}
                    onChange={e => setNewStock({...newStock, symbol: e.target.value.toUpperCase()})}
                  />
                  <input
                    type="number"
                    placeholder="Number of Shares"
                    className="w-full p-2 border rounded"
                    value={newStock.shares}
                    onChange={e => setNewStock({...newStock, shares: e.target.value})}
                  />
                  <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded">
                    Add Stock
                  </button>
                </form>
            </DialogContent>
          </Dialog>

          {/* Dialog for editing stock */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Stock</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Stock Symbol"
                  className="w-full p-2 border rounded bg-gray-100"
                  value={editingStock?.symbol || ''}
                  disabled
                />
                <input
                  type="number"
                  placeholder="Number of Shares"
                  className="w-full p-2 border rounded"
                  value={editingStock?.shares || ''}
                  onChange={e => setEditingStock({
                    ...editingStock,
                    shares: e.target.value
                  })}
                />
                <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded">
                  Update Stock
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Total Value</h3>
              <Wallet className="text-purple-500" size={24} />
            </div>
            <p className="text-2xl font-bold">${(portfolio.totalValue || 0).toFixed(2)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Daily Change</h3>
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <p className={`text-2xl font-bold ${(portfolio.dailyChangePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(portfolio.dailyChangePercent || 0).toFixed(2)}%
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ minWidth: '100px', padding: '12px 24px' }}>Symbol</TableHead>
              <TableHead style={{ minWidth: '100px', padding: '12px 24px' }}>Shares</TableHead>
              <TableHead style={{ minWidth: '100px', padding: '12px 24px' }}>Current Price</TableHead>
              <TableHead style={{ minWidth: '100px', padding: '12px 24px' }}>Total Value</TableHead>
              <TableHead style={{ minWidth: '100px', padding: '12px 24px' }}>Daily Change</TableHead>
              <TableHead style={{ minWidth: '100px', padding: '12px 24px' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {portfolio.stocks.map(stock => (
              <TableRow key={stock.symbol}>
                <TableCell className="font-medium">{stock.symbol}</TableCell>
                <TableCell>{stock.shares}</TableCell>
                <TableCell>${(stock.currentPrice || 0).toFixed(2)}</TableCell>
                <TableCell>${(stock.totalValue || 0).toFixed(2)}</TableCell>
                <TableCell className={stock.dailyChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {(stock.dailyChangePercent || 0).toFixed(2)}%
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(stock.symbol)} className="text-blue-600 hover:text-blue-800">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(stock.symbol)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            </TableBody>
          </Table>

        {/*portfolio.stocks.length == 0 ? (
          <div className = "text-center py-8">
            <p className="text-gray-500-mb-4"> No stocks in your portfolio yet.</p>
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 mx-auto">
                  <PlusCircle size={20} />
                  Add Your First Investment
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Stock</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Stock Symbol (e.g., AAPL)"
                    className="w-full p-2 border rounded"
                    value={newStock.symbol}
                    onChange={e => setNewStock({...newStock, symbol: e.target.value.toUpperCase()})}
                  />
                  <input
                    type="number"
                    placeholder="Number of Shares"
                    className="w-full p-2 border rounded"
                    value={newStock.shares}
                    onChange={e => setNewStock({...newStock, shares: e.target.value})}
                  />
                  <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded">
                    Add Stock
                  </button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Shares</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Daily Change</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {portfolio.stocks.map(stock => (
              <TableRow key={stock.symbol}>
                <TableCell className="font-medium">{stock.symbol}</TableCell>
                <TableCell>{stock.shares}</TableCell>
                <TableCell>${(stock.currentPrice || 0).toFixed(2)}</TableCell>
                <TableCell>${(stock.totalValue || 0).toFixed(2)}</TableCell>
                <TableCell className={stock.dailyChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {(stock.dailyChangePercent || 0).toFixed(2)}%
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(stock.symbol)} className="text-blue-600 hover:text-blue-800">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(stock.symbol)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            </TableBody>
          </Table>
        )*/}
      </div>
    );
  };