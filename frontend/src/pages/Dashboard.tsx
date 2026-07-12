import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Truck, Users, MapPin, IndianRupee, TrendingUp, TrendingDown, Gauge, Wrench } from 'lucide-react';

const fetchStats = async () => (await api.get('/reports/dashboard')).data;

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  accent: string;
}

function StatCard({ title, value, icon, trend, trendLabel, accent }: StatCardProps) {
  return (
    <div className="card p-5 animate-slide-up" style={{ opacity: 0 }}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${accent}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{title}{trendLabel && ` · ${trendLabel}`}</p>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['dashboard'], queryFn: fetchStats });

  if (isLoading) return <div className="flex-1 flex items-center justify-center text-slate-500 animate-pulse-soft">Loading dashboard…</div>;
  if (isError) return <div className="flex-1 flex items-center justify-center text-red-400">Failed to load dashboard</div>;

  const s = data || {};

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your fleet operations</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger">
        <StatCard title="Total Vehicles"     value={s.total_vehicles ?? 0}    icon={<Truck className="w-5 h-5 text-blue-400" />}    accent="bg-blue-500/10"    trend={5}  trendLabel="vs last week" />
        <StatCard title="Active Vehicles"    value={s.active_vehicles ?? 0}   icon={<Truck className="w-5 h-5 text-emerald-400" />} accent="bg-emerald-500/10" trend={12} trendLabel="vs yesterday" />
        <StatCard title="Total Drivers"      value={s.total_drivers ?? 0}     icon={<Users className="w-5 h-5 text-violet-400" />}  accent="bg-violet-500/10"  trend={3}  trendLabel="vs last month" />
        <StatCard title="Active Drivers"     value={s.active_drivers ?? 0}    icon={<Users className="w-5 h-5 text-cyan-400" />}    accent="bg-cyan-500/10"    trend={8}  trendLabel="vs yesterday" />
        <StatCard title="Total Trips"        value={s.total_trips ?? 0}       icon={<MapPin className="w-5 h-5 text-amber-400" />}   accent="bg-amber-500/10"   trend={15} trendLabel="vs last week" />
        <StatCard title="Completed Trips"    value={s.completed_trips ?? 0}   icon={<MapPin className="w-5 h-5 text-emerald-400" />} accent="bg-emerald-500/10" trend={22} trendLabel="vs last month" />
        <StatCard title="Total Revenue"      value={`₹${(s.total_revenue ?? 0).toLocaleString()}`} icon={<IndianRupee className="w-5 h-5 text-emerald-400" />} accent="bg-emerald-500/10" trend={8} trendLabel="vs last quarter" />
        <StatCard title="Total Expenses"     value={`₹${(s.total_expenses ?? 0).toLocaleString()}`} icon={<IndianRupee className="w-5 h-5 text-red-400" />}     accent="bg-red-500/10"     trend={-2} trendLabel="vs last month" />
        <StatCard title="Net Profit"         value={`₹${(s.net_profit ?? 0).toLocaleString()}`}     icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} accent="bg-emerald-500/10" trend={(s.net_profit ?? 0) >= 0 ? 12 : -5} />
        <StatCard title="Profit Margin"      value={`${(s.profit_margin ?? 0).toFixed(1)}%`}        icon={<Gauge className="w-5 h-5 text-amber-400" />}        accent="bg-amber-500/10" />
        <StatCard title="Fleet Utilization"  value={`${(s.fleet_utilization ?? 0).toFixed(1)}%`}    icon={<Gauge className="w-5 h-5 text-blue-400" />}         accent="bg-blue-500/10"    trend={7} trendLabel="vs last month" />
        <StatCard title="Maintenance Ratio"  value={`${(s.maintenance_cost_ratio ?? 0).toFixed(1)}%`} icon={<Wrench className="w-5 h-5 text-orange-400" />}   accent="bg-orange-500/10" />
      </div>
    </div>
  );
}
