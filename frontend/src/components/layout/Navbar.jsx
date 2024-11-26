import { NavLink } from 'react-router-dom';

export const Navbar = () => {
    return (
      <nav className="bg-slate-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">FinanceTracker</h1>
          <div className="flex gap-4">
            <NavLink to="/dashboard" className="hover:text-slate-300">Dashboard</NavLink>
            <NavLink to="/expenses" className="hover:text-slate-300">Expenses</NavLink>
            <NavLink to="/income" className="hover:text-slate-300">Income</NavLink>
            <NavLink to="/portfolio" className="hover:text-slate-300">Portfolio</NavLink>
            <button onClick={() => handleLogout()} className="hover:text-slate-300">Logout</button>
          </div>
        </div>
      </nav>
    );
  };