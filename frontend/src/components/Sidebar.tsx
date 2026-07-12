import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, MapPin, Wrench, Wallet, BarChart3, LogOut } from 'lucide-react';

const links = [
  { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/vehicles',    label: 'Vehicles',     icon: Truck },
  { to: '/drivers',     label: 'Drivers',      icon: Users },
  { to: '/trips',       label: 'Trips',        icon: MapPin },
  { to: '/maintenance', label: 'Maintenance',  icon: Wrench },
  { to: '/expenses',    label: 'Expenses',     icon: Wallet },
  { to: '/reports',     label: 'Reports',      icon: BarChart3 },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-dark-surface border-r border-dark-border shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-dark-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
          <Truck className="w-4 h-4 text-dark-bg" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">TransitOps</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-amber-500/10 text-amber-400 shadow-glow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-soft" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-dark-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}