import { useState } from 'react'
import './App.css'
import Dashboard from './pages/DashboardPage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SignupPage } from './pages/SignupPage'
import { SignInPage } from './pages/SignInPage'
import { ExpensesPage } from './pages/ExpensesPage'
import { PortfolioPage } from './pages/PortfolioPage'
import { BalancePage } from './pages/BalancePage'
import { BudgetPage } from './pages/BudgetPage'
import { IncomePage } from './pages/IncomePage'


function App() {
  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('jwt');

    // Redirect to login if not authenticated
    if (!isAuthenticated && window.location.pathname !== '/auth/signin' && window.location.pathname !== '/auth/signup') {
      return <Navigate to="/auth/signin" />;
    }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth/signin" element={<SignInPage />}/>
        <Route path="auth/signup" element={<SignupPage />} />

        {/* Protected Routes */}
        <Route 
          path="/dashboard/*" 
          element={isAuthenticated ? <Dashboard/> : <Navigate to="auth/signin"/>} 
        />
        <Route 
          path="/expenses" 
          element={isAuthenticated ? <ExpensesPage /> : <Navigate to="/auth/signin" />} 
        />
        <Route 
          path="/portfolio" 
          element={isAuthenticated ? <PortfolioPage /> : <Navigate to="/auth/signin" />} 
        />
        <Route 
          path="/balance" 
          element={isAuthenticated ? <BalancePage /> : <Navigate to="/auth/signin" />} 
        />
        <Route 
          path="/budget" 
          element={isAuthenticated ? <BudgetPage /> : <Navigate to="/auth/signin" />} 
        />
        <Route 
          path="/income" 
          element={isAuthenticated ? <IncomePage /> : <Navigate to="/auth/signin" />} 
        />
        
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth/signin"} />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
