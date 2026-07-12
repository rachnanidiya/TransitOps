import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/vehicles/Vehicles';
import Drivers from './pages/drivers/Drivers';
import Trips from './pages/trips/Trips';
import Maintenance from './pages/maintenance/Maintenance';
import Expenses from './pages/expenses/Expenses';
import Reports from './pages/reports/Reports';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useEffect, useState } from 'react';

// Auth wrapper for protected routes
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  if (checkingAuth) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Main layout with header and sidebar
const MainLayout: React.FC = () => {
  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row h-screen bg-dark-bg">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-dark-bg">
          <Outlet />
        </main>
      </div>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="trips" element={<Trips />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="reports" element={<Reports />} />
          {/* Other routes will go here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;