import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { Wrench, Truck, DollarSign, Edit2, Trash2, Plus, Check, X, Calendar, CheckCircle } from 'lucide-react';

// Maintenance types and statuses from the backend
const MAINTENANCE_TYPES = ['Oil Change', 'Tire Replacement', 'Engine Repair', 'General Service', 'Brake Service', 'Transmission Service'];
const MAINTENANCE_STATUSES = ['Active', 'Completed'];

const Maintenance: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch maintenance records
  const { data: maintenanceRecords = [], isLoading, error } = useQuery({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const response = await api.get('/maintenance');
      return response.data;
    }
  });

  // Create maintenance record mutation
  const createMutation = useMutation({
    mutationFn: (maintenanceData: any) => api.post('/maintenance', maintenanceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setSelectedMaintenance(null);
      setIsEditing(false);
    }
  });

  // Update maintenance record mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/maintenance/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setSelectedMaintenance(null);
      setIsEditing(false);
    }
  });

  // Complete maintenance mutation
  const completeMutation = useMutation({
    mutationFn: (id: number) => api.put(`/maintenance/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setSelectedMaintenance(null);
    }
  });

  // Delete maintenance record mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/maintenance/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setSelectedMaintenance(null);
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (maintenance: any) => {
    setSelectedMaintenance(maintenance);
    setIsEditing(true);
  };

  const handleSave = (maintenanceData: any) => {
    if (isEditing && selectedMaintenance?.id) {
      updateMutation.mutate({ id: selectedMaintenance.id, data: maintenanceData });
    } else {
      createMutation.mutate(maintenanceData);
    }
  };

  const handleCancel = () => {
    setSelectedMaintenance(null);
    setIsEditing(false);
  };

  const handleComplete = (id: number) => {
    if (window.confirm('Are you sure you want to mark this maintenance as completed?')) {
      completeMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="text-center py-12">Loading maintenance records...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error loading maintenance records</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-wrap">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Maintenance Management
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setSelectedMaintenance(null);
              setIsEditing(false);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            <Plus className="mr-2" /> Add Maintenance
          </button>
        </div>
      </div>

      {/* Maintenance Form Modal */}
      {selectedMaintenance !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {isEditing ? 'Edit Maintenance' : 'Add Maintenance'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const maintenanceData = Object.fromEntries(formData.entries());

              // Convert date and numeric fields
              if (maintenanceData.scheduled_date) {
                maintenanceData.scheduled_date = maintenanceData.scheduled_date;
              }
              if (maintenanceData.completed_date) {
                maintenanceData.completed_date = maintenanceData.completed_date;
              }
              if (maintenanceData.cost) {
                maintenanceData.cost = parseFloat(maintenanceData.cost);
              }

              handleSave(maintenanceData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  defaultValue={isEditing ? selectedMaintenance?.description || '' : ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance Type
                  </label>
                  <select
                    name="type"
                    required
                    defaultValue={isEditing ? selectedMaintenance?.type || '' : MAINTENANCE_TYPES[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  >
                    {MAINTENANCE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle
                  </label>
                  <select
                    name="vehicle_id"
                    required
                    defaultValue={isEditing ? selectedMaintenance?.vehicle_id || '' : ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  status("placeholder="Select Vehicle")>
          <Options values={[]} /> // In a real app, we'd fetch vehicles here
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      name="scheduled_date"
                      defaultValue={isEditing ? selectedMaintenance?.scheduled_date || '' : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost ($)
                    </label>
                    <input
                      type="number"
                      name="cost"
                      min="0"
                      step="0.01"
                      defaultValue={isEditing ? selectedMaintenance?.cost || 0 : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue={isEditing ? selectedMaintenance?.status || '' : MAINTENANCE_STATUSES[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  >
                    {MAINTENANCE_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isEditing ? 'Update Maintenance' : 'Create Maintenance'}
                    {createMutation.isLoading || updateMutation.isLoading && (
                      <span className="ml-2 animate-spin h-4 w-4 border-2 border-white rounded-full"></span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Filters and Actions */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Filter by Type
          </label>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="">All Types</option>
            {MAINTENANCE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Filter by Status
          </label>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="">All Statuses</option>
            {MAINTENANCE_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Maintenance Records Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Scheduled Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {maintenanceRecords.map((maintenance: any) => (
                <tr key={maintenance.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {maintenance.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {maintenance.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {maintenance.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {/* In a real app, we'd show vehicle name */}
                    Vehicle #{maintenance.vehicle_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {maintenance.scheduled_date ? new Date(maintenance.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${maintenance.cost?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${maintenance.status === 'Active' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {maintenance.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {maintenance.status === 'Active' && (
                        <>
                          <button
                            onClick={() => handleComplete(maintenance.id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleEdit(maintenance)}
                            className="px-3 py-1 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(maintenance.id)}
                            className="px-3 py-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 text-xs"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {maintenance.status === 'Completed' && (
                        <>
                          <button
                            onClick={() => handleEdit(maintenance)}
                            className="px-3 py-1 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 text-xs"
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {maintenanceRecords.length === 0 && (
                <tr>
                  <td colspan="8" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No maintenance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;