import { useQuery } from '@tanstack/react-query';
import api from '../services/api';


const fetchDashboardStats = async () => {
  const response = await api.get('/reports/dashboard');
  return response.data;
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend: number | null;
  trendLabel?: string;
  color?: string;
}

const StatCard = ({ title, value, icon, trend, trendLabel = '', color = 'primary' }: StatCardProps) => {
  const getColorClass = (color: string) => {
    switch (color) {
      case 'success': return 'text-dark-success';
      case 'warning': return 'text-dark-warning';
      case 'danger': return 'text-danger';
      case 'info': return 'text-dark-info';
      default: return 'text-dark-primary';
    }
  };

  const getTrendColor = (trend: number | null) => {
    if (trend === null) return 'text-white/60';
    return trend >= 0 ? 'text-dark-success' : 'text-danger';
  };

  return (
    <div className="dashboard-card hover:shadow-glass-hover transition-all duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg bg-dark-${color}/10`}>
            <i className={`text-2xl ${getColorClass(color)} ${icon}`}></i>
          </div>
          <h3 className="text-sm font-medium text-white/70">{title}</h3>
        </div>
        {trend !== null && (
          <div className="text-sm">
            <span className={`${getTrendColor(trend)} font-medium`}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </span>
            <span className="ml-1 text-xs text-white/50">{trendLabel}</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) return <div className="col-span-2 text-center py-12 text-white/70 animate-fade-in-up">Loading dashboard...</div>;
  if (error) return <div className="col-span-2 text-center py-12 text-danger animate-fade-in-up">Error loading dashboard</div>;

  // Default data structure if no data is returned
  const stats = data || {
    total_vehicles: 0,
    active_vehicles: 0,
    total_drivers: 0,
    active_drivers: 0,
    total_trips: 0,
    completed_trips: 0,
    total_revenue: 0,
    total_expenses: 0,
    net_profit: 0,
    profit_margin: 0,
    avg_trip_distance: 0,
    avg_fuel_efficiency: 0,
    on_time_delivery_rate: 0,
    maintenance_cost_ratio: 0,
    fleet_utilization: 0
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-wrap">
        <h1 className="text-2xl font-bold text-white">
          Dashboard
        </h1>
        <button
          onClick={() => {
            // Refresh data
            // In a real app, we'd invalidate the query cache
          }}
          className="px-4 py-2 bg-dark-primary text-white rounded-md hover:bg-dark-primary/90 transition-colors duration-300 hover:shadow-glass-hover"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Vehicles"
          value={stats.total_vehicles}
          icon="Truck"
          trend={5}
          trendLabel="vs last week"
          color="info"
        />
        <StatCard
          title="Active Vehicles"
          value={stats.active_vehicles}
          icon="Truck"
          trend={12}
          trendLabel="vs yesterday"
          color="success"
        />
        <StatCard
          title="Total Drivers"
          value={stats.total_drivers}
          icon="Users"
          trend={3}
          trendLabel="vs last month"
          color="info"
        />
        <StatCard
          title="Active Drivers"
          value={stats.active_drivers}
          icon="Users"
          trend={8}
          trendLabel="vs yesterday"
          color="success"
        />
        <StatCard
          title="Total Trips"
          value={stats.total_trips}
          icon="MapPin"
          trend={15}
          trendLabel="vs last week"
          color="info"
        />
        <StatCard
          title="Completed Trips"
          value={stats.completed_trips}
          icon="MapPin"
          trend={22}
          trendLabel="vs last month"
          color="success"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.total_revenue.toLocaleString()}`}
          icon="TrendingUp"
          trend={8}
          trendLabel="vs last quarter"
          color="success"
        />
        <StatCard
          title="Total Expenses"
          value={`$${stats.total_expenses.toLocaleString()}`}
          icon="PiggyBank"
          trend={-2}
          trendLabel="vs last month"
          color="danger"
        />
        <StatCard
          title="Net Profit"
          value={`$${stats.net_profit.toLocaleString()}`}
          icon="TrendingUp"
          trend={stats.net_profit >= 0 ? 12 : -5}
          trendLabel="vs last month"
          color={stats.net_profit >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          title="Profit Margin"
          value={`${stats.profit_margin.toFixed(1)}%`}
          icon="ChartLine"
          trend={stats.profit_margin >= 0 ? 5 : -2}
          trendLabel="vs last quarter"
          color={stats.profit_margin >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          title="Fleet Utilization"
          value={`${stats.fleet_utilization}%`}
          icon="Gauge"
          trend={7}
          trendLabel="vs last month"
          color="info"
        />
        <StatCard
          title="Avg Trip Distance"
          value={`${stats.avg_trip_distance.toFixed(1)} km`}
          icon="MapPin"
          trend={4}
          trendLabel="vs last week"
          color="info"
        />
        <StatCard
          title="Fuel Efficiency"
          value={`${stats.avg_fuel_efficiency.toFixed(1)} MPG`}
          icon="TrendingUp"
          trend={-1}
          trendLabel="vs last month"
          color={stats.avg_fuel_efficiency > 0 ? 'success' : 'danger'}
        />
        <StatCard
          title="On-Time Delivery"
          value={`${stats.on_time_delivery_rate.toFixed(1)}%`}
          icon="Calendar"
          trend={6}
          trendLabel="vs last week"
          color="success"
        />
      </div>
    </div>
  );
};

export default Dashboard;