import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import {
  Truck,
  AlertTriangle,
  Users,
  ChartLine,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Calendar,
  MapPin,
  Gauge
} from 'lucide-react';

const Icons: any = {
  Truck, AlertTriangle, Users, ChartLine, TrendingUp, TrendingDown, PiggyBank, Calendar, MapPin, Gauge
};

const fetchDashboardStats = async () => {
  const response = await api.get('/reports/dashboard');
  return response.data;
};

const StatCard = ({ title, value, icon, trend, trendLabel = '' }: any) => {
  const IconComponent = Icons[icon] || MapPin;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <IconComponent className="h-6 w-6 text-indigo-500" />
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</h3>
        </div>
        {trend !== null && (
          <div className="text-sm">
            <span className={`font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </span>
            <span className="ml-1 text-xs text-gray-500">{trendLabel}</span>
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) return <div className="col-span-2 text-center py-12">Loading dashboard...</div>;
  if (isError) return <div className="col-span-2 text-center py-12 text-red-600">Error loading dashboard</div>;

  // Assuming data structure from API
  // Adjust based on actual API response
  const stats = data || {
    activeVehicles: 0,
    activeTrips: 0,
    fleetUtilization: 0,
    totalRevenue: 0,
    totalCosts: 0,
    onTimeDelivery: 0,
    fuelEfficiency: 0,
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-wrap">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Vehicles"
          value={stats.activeVehicles}
          icon="Truck"
          trend={5}
          trendLabel="vs last week"
        />
        <StatCard
          title="Active Trips"
          value={stats.activeTrips}
          icon="MapPin"
          trend={12}
          trendLabel="vs yesterday"
        />
        <StatCard
          title="Fleet Utilization"
          value={`${stats.fleetUtilization}%`}
          icon="Gauge"
          trend={3}
          trendLabel="vs last month"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon="TrendingUp"
          trend={8}
          trendLabel="vs last quarter"
        />
        <StatCard
          title="Total Costs"
          value={`$${stats.totalCosts.toLocaleString()}`}
          icon="PiggyBank"
          trend={-2}
          trendLabel="vs last month"
        />
        <StatCard
          title="On-time Delivery"
          value={`${stats.onTimeDelivery}%`}
          icon="Calendar"
          trend={4}
          trendLabel="vs last week"
        />
        <StatCard
          title="Fuel Efficiency"
          value={`${stats.fuelEfficiency} MPG`}
          icon="AlertTriangle"
          trend={-1}
          trendLabel="vs last month"
        />
        <StatCard
          title="Revenue per Trip"
          value={`$${(stats.totalRevenue / Math.max(stats.activeTrips, 1)).toFixed(2)}`}
          icon="ChartLine"
          trend={6}
          trendLabel="vs last week"
        />
      </div>
    </div>
  );
};

export default Dashboard;