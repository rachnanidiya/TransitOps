import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { ChartBar, ChartPie, ChartLine, Truck, Users, MapPin, PiggyBank, Calendar, DollarSign, FileText } from 'lucide-react';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch different reports
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/reports/dashboard');
      return response.data;
    }
  });

  const { data: fuelEfficiencyData, isLoading: fuelLoading } = useQuery({
    queryKey: ['fuel-efficiency'],
    queryFn: async () => {
      const response = await api.get('/reports/fuel-efficiency');
      return response.data;
    }
  });

  const { data: fleetUtilizationData, isLoading: utilizationLoading } = useQuery({
    queryKey: ['fleet-utilization'],
    queryFn: async () => {
      const response = await api.get('/reports/fleet-utilization');
      return response.data;
    }
  });

  const { data: operationalCostData, isLoading: costLoading } = useQuery({
    queryKey: ['operational-cost'],
    queryFn: async () => {
      const response = await api.get('/reports/operational-cost');
      return response.data;
    }
  });

  const { data: vehicleROIData, isLoading: roiLoading } = useQuery({
    queryKey: ['vehicle-roi'],
    queryFn: async () => {
      const response = await api.get('/reports/vehicle-roi');
      return response.data;
    }
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-wrap">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Reports & Analytics
        </h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'dashboard'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('fuel-efficiency')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'fuel-efficiency'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          Fuel Efficiency
        </button>
        <button
          onClick={() => setActiveTab('fleet-utilization')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'fleet-utilization'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          Fleet Utilization
        </button>
        <button
          onClick={() => setActiveTab('operational-cost')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'operational-cost'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          Operational Cost
        </button>
        <button
          onClick={() => setActiveTab('vehicle-roi')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'vehicle-roi'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          Vehicle ROI
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Fleet Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Total Vehicles:</span>
                  <span className="font-medium">{dashboardData?.total_vehicles || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Active Vehicles:</span>
                  <span className="font-medium text-green-600">{dashboardData?.active_vehicles || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Total Drivers:</span>
                  <span className="font-medium">{dashboardData?.total_drivers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Active Drivers:</span>
                  <span className="font-medium text-green-600">{dashboardData?.active_drivers || 0}</span
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Total Trips:</span>
                  <span className="font-medium">{dashboardData?.total_trips || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Completed Trips:</span>
                  <span className="font-medium text-green-600">{dashboardData?.completed_trips || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Financial Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Total Revenue:</span>
                  <span className="font-medium text-green-600">${dashboardData?.total_revenue?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Total Expenses:</span>
                  <span className="font-medium text-red-600">${dashboardData?.total_expenses?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Net Profit:</span>
                  <span className="font-medium">${dashboardData?.net_profit?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Profit Margin:</span>
                  <span className="font-medium">
                    ${(dashboardData?.profit_margin || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Performance Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Average Trip Distance:</span>
                  <span className="font-medium">{dashboardData?.avg_trip_distance?.toFixed(1) || 0} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Average Fuel Efficiency:</span>
                  <span className="font-medium">{dashboardData?.avg_fuel_efficiency?.toFixed(1) || 0} MPG</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">On-time Delivery Rate:</span>
                  <span className="font-medium text-green-600">
                    ${dashboardData?.on_time_delivery_rate?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Maintenance Cost Ratio:</span>
                  <span className="font-medium">
                    ${(dashboardData?.maintenance_cost_ratio || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fuel Efficiency Tab */}
        {activeTab === 'fuel-efficiency' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Fuel Efficiency Analysis
              </h2>
              {fuelLoading ? (
                <div className="text-center py-8">Loading fuel efficiency data...</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Fleet Average MPG:</span>
                    <span className="font-medium text-xl">
                      {fuelEfficiencyData?.fleet_avg_mpg?.toFixed(1) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Best Performing Vehicle:</span>
                    <span className="font-medium">
                      #{fuelEfficiencyData?.best_vehicle_id || 'N/A'}
                      ({fuelEfficiencyData?.best_mpg?.toFixed(1) || 0} MPG)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Worst Performing Vehicle:</span>
                    <span className="font-medium">
                      #{fuelEfficiencyData?.worst_vehicle_id || 'N/A'}
                      ({fuelEfficiencyData?.worst_mpg?.toFixed(1) || 0} MPG)
                    </span>
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                    <h3 className="font-semibold mb-2">Fuel Efficiency by Vehicle Type</h3>
                    <div className="space-y-2">
                      {Object.entries(fuelEfficiencyData?.mpg_by_type || {}).map(([type, mpg]) => (
                        <div key={type} className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300 capitalize">{type}:</span>
                          <span className="font-medium">{mpg?.toFixed(1) || 0} MPG</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fleet Utilization Tab */}
        {activeTab === 'fleet-utilization' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Fleet Utilization Report
              </h2>
              {utilizationLoading ? (
                <div className="text-center py-8">Loading fleet utilization data...</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-2">Utilization Statistics</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Overall Utilization Rate:</span>
                          <span className="font-medium">
                            ${(fleetUtilizationData?.utilization_rate || 0).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Average Daily Miles per Vehicle:</span>
                          <span className="font-medium">
                            {fleetUtilizationData?.avg_daily_miles_per_vehicle?.toFixed(1) || 0} miles
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Vehicles in Use Today:</span>
                          <span className="font-medium">
                            {fleetUtilizationData?.vehicles_in_use_today || 0}/
                            {fleetUtilizationData?.total_vehicles || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Idle Vehicles:</span>
                          <span className="font-medium text-red-600">
                            {fleetUtilizationData?.idle_vehicles || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Utilization by Vehicle Type</h3>
                      <div className="space-y-2">
                        {Object.entries(fleetUtilizationData?.utilization_by_type || {}).map(([type, utilization]) => (
                          <div key={type} className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300 capitalize">{type}:</span>
                            <span className="font-medium">
                              ${(utilization || 0).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Operational Cost Tab */}
        {activeTab === 'operational-cost' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Operational Cost Analysis
              </h2>
              {costLoading ? (
                <div className="text-center py-8">Loading operational cost data...</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-2">Cost Breakdown</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Total Monthly Cost:</span>
                          <span className="font-medium text-xl">
                            $${operationalCostData?.total_monthly_cost?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Cost per Mile:</span>
                          <span className="font-medium">
                            $${(operationalCostData?.cost_per_mile || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Cost per Trip:</span>
                          <span className="font-medium">
                            $${(operationalCostData?.cost_per_trip || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Fixed Costs:</span>
                          <span className="font-medium">
                            $${operationalCostData?.fixed_costs?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Variable Costs:</span>
                          <span className="font-medium">
                            $${operationalCostData?.variable_costs?.toLocaleString() || '0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Cost by Category</h3>
                      <div className="space-y-2">
                        {Object.entries(operationalCostData?.cost_by_category || {}).map(([category, amount]) => (
                          <div key={category} className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300 capitalize">{category}:</span>
                            <span className="font-medium">
                              $${amount?.toLocaleString() || '0'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vehicle ROI Tab */}
        {activeTab === 'vehicle-roi' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Vehicle Return on Investment (ROI)
              </h2>
              {roiLoading ? (
                <div className="text-center py-8">Loading vehicle ROI data...</div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Vehicle
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Age (Years)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Total Revenue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Total Costs
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Net Profit
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            ROI (%)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {vehicleROIData?.vehicles?.map((vehicle: any, index: number) => (
                          <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                              #{vehicle.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {vehicle.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {vehicle.age_years?.toFixed(1) || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              $${vehicle.total_revenue?.toLocaleString() || '0'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              $${vehicle.total_costs?.toLocaleString() || '0'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              $${vehicle.net_profit?.toLocaleString() || '0'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vehicle.roi_percentage >= 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'}`}>
                                ${vehicle.roi_percentage?.toFixed(1) || 0}%
                              </span>
                            </td>
                          </tr>
                        ))}

                        {vehicleROIData?.vehicles?.length === 0 && (
                          <tr>
                            <td colspan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                              No vehicle data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                    <h3 className="font-semibold mb-2">Fleet Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Average Fleet Age:</span>
                        <span className="font-medium">
                          ${vehicleROIData?.fleet_summary?.avg_age || 0} years
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Total Fleet Value:</span>
                        <span className="font-medium">
                          $${vehicleROIData?.fleet_summary?.total_value?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Weighted Average ROI:</span>
                        <span className="font-medium">
                          ${(vehicleROIData?.fleet_summary?.weighted_avg_roi || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Export Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => {
              // In a real app, this would trigger a CSV export based on the active tab
              alert(`Exporting ${activeTab} report to CSV...`);
            }}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export Report as CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;