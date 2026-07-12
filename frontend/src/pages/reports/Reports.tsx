import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Truck, Users, MapPin, IndianRupee, Gauge, Wrench, TrendingUp, TrendingDown } from 'lucide-react';

const fetchStats = async () => (await api.get('/reports/dashboard')).data;

function MetricRow({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-dark-border last:border-0">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

export default function Reports() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['reports'], queryFn: fetchStats });

  if (isLoading) return <div className="flex-1 flex items-center justify-center text-slate-500 animate-pulse-soft">Loading reports…</div>;
  if (isError) return <div className="flex-1 flex items-center justify-center text-red-400">Failed to load reports</div>;

  const s = data || {};
  const netPositive = (s.net_profit ?? 0) >= 0;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Detailed fleet and financial analytics</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 stagger">
        {/* Fleet Overview */}
        <div className="card p-6 animate-slide-up" style={{ opacity: 0 }}>
          <h2 className="text-base font-semibold text-white mb-4">Fleet Overview</h2>
          <MetricRow label="Total Vehicles"   value={String(s.total_vehicles ?? 0)}   icon={Truck}  color="bg-blue-500/10 text-blue-400" />
          <MetricRow label="Active Vehicles"  value={String(s.active_vehicles ?? 0)}  icon={Truck}  color="bg-emerald-500/10 text-emerald-400" />
          <MetricRow label="Total Drivers"    value={String(s.total_drivers ?? 0)}    icon={Users}  color="bg-violet-500/10 text-violet-400" />
          <MetricRow label="Active Drivers"   value={String(s.active_drivers ?? 0)}   icon={Users}  color="bg-cyan-500/10 text-cyan-400" />
          <MetricRow label="Fleet Utilization" value={`${(s.fleet_utilization ?? 0).toFixed(1)}%`} icon={Gauge} color="bg-amber-500/10 text-amber-400" />
        </div>

        {/* Trip Analytics */}
        <div className="card p-6 animate-slide-up" style={{ opacity: 0 }}>
          <h2 className="text-base font-semibold text-white mb-4">Trip Analytics</h2>
          <MetricRow label="Total Trips"      value={String(s.total_trips ?? 0)}      icon={MapPin} color="bg-amber-500/10 text-amber-400" />
          <MetricRow label="Completed Trips"  value={String(s.completed_trips ?? 0)}  icon={MapPin} color="bg-emerald-500/10 text-emerald-400" />
          <MetricRow label="On-Time Delivery" value={`${(s.on_time_delivery_rate ?? 0).toFixed(1)}%`} icon={Gauge} color="bg-blue-500/10 text-blue-400" />
          <MetricRow label="Avg Trip Distance" value={`${(s.avg_trip_distance ?? 0).toFixed(1)} km`}  icon={MapPin} color="bg-violet-500/10 text-violet-400" />
          <MetricRow label="Fuel Efficiency"   value={`${(s.avg_fuel_efficiency ?? 0).toFixed(1)} MPG`} icon={Gauge} color="bg-cyan-500/10 text-cyan-400" />
        </div>

        {/* Financial Summary */}
        <div className="card p-6 lg:col-span-2 animate-slide-up" style={{ opacity: 0 }}>
          <h2 className="text-base font-semibold text-white mb-4">Financial Summary</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <IndianRupee className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-400">₹{(s.total_revenue ?? 0).toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Total Revenue</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <IndianRupee className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-400">₹{(s.total_expenses ?? 0).toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Total Expenses</p>
            </div>
            <div className={`text-center p-4 rounded-xl ${netPositive ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-red-500/5 border border-red-500/10'}`}>
              {netPositive ? <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" /> : <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />}
              <p className={`text-2xl font-bold ${netPositive ? 'text-emerald-400' : 'text-red-400'}`}>₹{(s.net_profit ?? 0).toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Net Profit ({(s.profit_margin ?? 0).toFixed(1)}% margin)</p>
            </div>
          </div>
          <div className="mt-4">
            <MetricRow label="Maintenance Cost Ratio" value={`${(s.maintenance_cost_ratio ?? 0).toFixed(1)}%`} icon={Wrench} color="bg-orange-500/10 text-orange-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
