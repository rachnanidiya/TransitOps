import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/vehicles/Vehicles';
import Drivers from './pages/drivers/Drivers';
import Trips from './pages/trips/Trips';
import Maintenance from './pages/maintenance/Maintenance';
import Expenses from './pages/expenses/Expenses';
import Reports from './pages/reports/Reports';
import Sidebar from './components/Sidebar';

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    setIsAuth(!!localStorage.getItem('token'));
    setChecking(false);
  }, []);
  if (checking) return <div className="flex h-screen items-center justify-center text-dark-muted">Loading…</div>;
  return isAuth ? children : <Navigate to="/login" replace />;
};

const MainLayout = () => (
  <div className="flex h-screen overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="trips" element={<Trips />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
