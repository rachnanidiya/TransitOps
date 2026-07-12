import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { Edit2, Trash2, Plus, X } from 'lucide-react';

// Vehicle types and statuses from the backend
const VEHICLE_TYPES = ['Truck', 'Van', 'Bus', 'Car'];
const VEHICLE_STATUSES = ['Available', 'On Trip', 'In Shop', 'Retired'];

const Vehicles: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch vehicles
  const { data: vehicles = [], isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const response = await api.get('/vehicles');
      return response.data;
    }
  });

  // Create vehicle mutation
  const createMutation = useMutation({
    mutationFn: (vehicleData: any) => api.post('/vehicles', vehicleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setSelectedVehicle(null);
      setIsEditing(false);
    }
  });

  // Update vehicle mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/vehicles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setSelectedVehicle(null);
      setIsEditing(false);
    }
  });

  // Delete vehicle mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setSelectedVehicle(null);
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setIsEditing(true);
  };

  const handleSave = (vehicleData: any) => {
    if (isEditing && selectedVehicle?.id) {
      updateMutation.mutate({ id: selectedVehicle.id, data: vehicleData });
    } else {
      createMutation.mutate(vehicleData);
    }
  };

  const handleCancel = () => {
    setSelectedVehicle(null);
    setIsEditing(false);
  };

  if (isLoading) return <div className="text-center py-12 text-white/70 animate-fade-in-up">Loading vehicles...</div>;
  if (error) return <div className="text-center py-12 text-danger animate-fade-in-up">Error loading vehicles</div>;

  return (

    <div className="p-6">
      <div className="mb-6 flex justify-between items-wrap">
        <h1 className="text-2xl font-bold text-white">
          Vehicle Management
        </h1>
        <button
          onClick={() => {
            setSelectedVehicle(null);
            setIsEditing(false);
          }}
          className="px-4 py-2 bg-dark-primary text-white rounded-md hover:bg-dark-primary/90 transition-colors duration-300 hover:shadow-glass-hover"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Vehicle
        </button>
      </div>

      {/* Vehicle Form Modal */}
      {selectedVehicle !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel dark bg-white/10 backdrop-blur-lg border border-border/20 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Vehicle' : 'Add Vehicle'}
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
              // Form data would be handled by React Hook Form in a real implementation
              // For now, we'll simulate with basic validation
              const formData = new FormData(e.target as HTMLFormElement);
              const vehicleData = Object.fromEntries(formData.entries()) as Record<string, any>;

              // Convert numeric fields
              if (vehicleData.max_load_capacity) vehicleData.max_load_capacity = parseFloat(vehicleData.max_load_capacity as string);
              if (vehicleData.acquisition_cost) vehicleData.acquisition_cost = parseFloat(vehicleData.acquisition_cost as string);
              if (vehicleData.odometer) vehicleData.odometer = parseFloat(vehicleData.odometer as string);

              handleSave(vehicleData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  name="registration_number"
                  required
                  defaultValue={isEditing ? selectedVehicle?.registration_number || '' : ''}
                  className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Model Name
                </label>
                <input
                  type="text"
                  name="name_model"
                  required
                  defaultValue={isEditing ? selectedVehicle?.name_model || '' : ''}
                  className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    required
                    defaultValue={isEditing ? selectedVehicle?.type || '' : VEHICLE_TYPES[0]}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  >
                    {VEHICLE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue={isEditing ? selectedVehicle?.status || '' : VEHICLE_STATUSES[0]}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  >
                    {VEHICLE_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Max Load Capacity (kg)
                  </label>
                  <input
                    type="number"
                    name="max_load_capacity"
                    required
                    min="0"
                    defaultValue={isEditing ? selectedVehicle?.max_load_capacity || 0 : ''}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Acquisition Cost ($)
                  </label>
                  <input
                    type="number"
                    name="acquisition_cost"
                    required
                    min="0"
                    step="0.01"
                    defaultValue={isEditing ? selectedVehicle?.acquisition_cost || 0 : ''}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Odometer (km)
                </label>
                <input
                  type="number"
                  name="odometer"
                  required
                  min="0"
                  defaultValue={isEditing ? selectedVehicle?.odometer || 0 : ''}
                  className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                />
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
                  {isEditing ? 'Update Vehicle' : 'Create Vehicle'}
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <span className="ml-2 h-4 w-4 border-2 border-white/20 rounded-full animate-spin"></span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">
            Filter by Type
          </label>
          <select
            className="mt-1 block w-full rounded-lg border border-border/50:border-50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
          >
            <option value="">All Types</option>
            {VEHICLE_TYPES.map(type => (
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
            {VEHICLE_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="glass-panel dark bg-white/5 backdrop-blur-lg border border-border/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-dark-bg/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Registration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Capacity (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Cost ($)
                </th>
                <th className="px-6 py-3 textLeft text-xs font-medium text-white/50 uppercase tracking-wider">
                  Odometer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vehicles.map((vehicle: any) => (
                <tr key={vehicle.id} className="hover:bg-dark-bg/10 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {vehicle.registration_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {vehicle.name_model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-dark-primary/20 text-dark-primary`}>
                      {vehicle.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vehicle.status === 'Available' ? 'bg-dark-success/20 text-dark-success' : vehicle.status === 'On Trip' ? 'bg-dark-info/20 text-dark-info' : vehicle.status === 'In Shop' ? 'bg-dark-warning/20 text-dark-warning' : 'bg-dark-danger/20 text-dark-danger'}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {vehicle.max_load_capacity?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    ${vehicle.acquisition_cost?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {vehicle.odometer?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="text-dark-primary hover:text-white dark:hover:text-dark-primary/90 mr-3"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="text-danger hover:text-dark-danger/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-white/50">
                    No vehicles found
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

export default Vehicles;