import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, X } from 'lucide-react';

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

  if (isLoading) return <div className="text-center py-12 text-white/70 animate-fade-in-up">Loading maintenance records...</div>;
  if (error) return <div className="text-center py-12 text-danger animate-fade-in-up">Error loading maintenance records</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-wrap">
        <h1 className="text-2xl font-bold text-white">
          Maintenance Management
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setSelectedMaintenance(null);
              setIsEditing(false);
            }}
            className="px-4 py-2 bg-dark-primary text-white rounded-md hover:bg-dark-primary/90 transition-colors duration-300 hover:shadow-glass-hover"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Maintenance
          </button>
        </div>
      </div>

      {/* Maintenance Form Modal */}
      {selectedMaintenance !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel dark bg-white/10 backdrop-blur-lg border border-border/20 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Maintenance' : 'Add Maintenance'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const maintenanceData = Object.fromEntries(formData.entries()) as Record<string, any>;

              // Convert date and numeric fields
              if (maintenanceData.scheduled_date) {
                maintenanceData.scheduled_date = maintenanceData.scheduled_date as string;
              }
              if (maintenanceData.completed_date) {
                maintenanceData.completed_date = maintenanceData.completed_date as string;
              }
              if (maintenanceData.cost) {
                maintenanceData.cost = parseFloat(maintenanceData.cost as string);
              }

              handleSave(maintenanceData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  defaultValue={isEditing ? selectedMaintenance?.description || '' : ''}
                  className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Maintenance Type
                  </label>
                  <select
                    name="type"
                    required
                    defaultValue={isEditing ? selectedMaintenance?.type || '' : MAINTENANCE_TYPES[0]}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  >
                    {MAINTENANCE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Vehicle
                  </label>
                  <select
                    name="vehicle_id"
                    required
                    defaultValue={isEditing ? selectedMaintenance?.vehicle_id || '' : ''}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  >
                    <option value="" disabled>Select Vehicle</option>
                    {/* In a real app, we'd fetch vehicles here */}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    name="scheduled_date"
                    defaultValue={isEditing ? selectedMaintenance?.scheduled_date || '' : ''}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Cost ($)
                  </label>
                  <input
                    type="number"
                    name="cost"
                    min="0"
                    step="0.01"
                    defaultValue={isEditing ? selectedMaintenance?.cost || 0 : ''}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  required
                  defaultValue={isEditing ? selectedMaintenance?.status || '' : MAINTENANCE_STATUSES[0]}
                  className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
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
                  className="px-4 py-2 bg-dark-surface text-white/60 rounded-md hover:bg-dark-surface/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-dark-primary text-white rounded-md hover:bg-dark-primary/90 transition-colors duration-300 disabled:opacity-50"
                >
                  {isEditing ? 'Update Maintenance' : 'Create Maintenance'}
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <span className="ml-2 h-4 w-4 border-2 border-white/20 rounded-full animate-spin"></span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Filters and Actions */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">
            Filter by Type
          </label>
          <select
            className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
          >
            <option value="">All Types</option>
            {MAINTENANCE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">
            Filter by Status
          </label>
          <select
            className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
          >
            <option value="">All Statuses</option>
            {MAINTENANCE_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Maintenance Records Table */}
      <div className="glass-panel dark bg-white/5 backdrop-blur-lg border border-border/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-dark-bg/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Scheduled Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {maintenanceRecords.map((maintenance: any) => (
                <tr key={maintenance.id} className="hover:bg-dark-bg/10 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {maintenance.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {maintenance.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-dark-primary/20 text-dark-primary`}>
                      {maintenance.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {/* In a real app, we'd show vehicle name */}
                    Vehicle #{maintenance.vehicle_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {maintenance.scheduled_date ? new Date(maintenance.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    ${maintenance.cost?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${maintenance.status === 'Active' ? 'bg-dark-warning/20 text-dark-warning' : 'bg-dark-success/20 text-dark-success'}`}>
                      {maintenance.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {maintenance.status === 'Active' && (
                        <>
                          <button
                            onClick={() => handleComplete(maintenance.id)}
                            className="text-dark-success hover:text-white dark:hover:text-dark-success/90"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleEdit(maintenance)}
                            className="text-dark-primary hover:text-white dark:hover:text-dark-primary/90 mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(maintenance.id)}
                            className="text-danger hover:text-dark-danger/90"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {maintenance.status === 'Completed' && (
                        <>
                          <button
                            onClick={() => handleEdit(maintenance)}
                            className="text-dark-primary hover:text-white dark:hover:text-dark-primary/90"
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
                  <td colSpan={8} className="px-6 py-4 text-center text-white/50">
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