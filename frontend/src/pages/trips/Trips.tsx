import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, X } from 'lucide-react';

// Trip statuses from the backend
const TRIP_STATUSES = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

const Trips: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch trips
  const { data: trips = [], isLoading, error } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const response = await api.get('/trips');
      return response.data;
    }
  });

  // Create trip mutation
  const createMutation = useMutation({
    mutationFn: (tripData: any) => api.post('/trips', tripData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setSelectedTrip(null);
      setIsEditing(false);
    }
  });

  // Update trip mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/trips/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setSelectedTrip(null);
      setIsEditing(false);
    }
  });

  // Dispatch trip mutation
  const dispatchMutation = useMutation({
    mutationFn: (id: number) => api.put(`/trips/${id}/dispatch`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setSelectedTrip(null);
    }
  });

  // Complete trip mutation
  const completeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/trips/${id}/complete`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setSelectedTrip(null);
    }
  });

  // Delete trip mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/trips/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setSelectedTrip(null);
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (trip: any) => {
    setSelectedTrip(trip);
    setIsEditing(true);
  };

  const handleSave = (tripData: any) => {
    if (isEditing && selectedTrip?.id) {
      updateMutation.mutate({ id: selectedTrip.id, data: tripData });
    } else {
      createMutation.mutate(tripData);
    }
  };

  const handleCancel = () => {
    setSelectedTrip(null);
    setIsEditing(false);
  };

  const handleDispatch = (id: number) => {
    if (window.confirm('Are you sure you want to dispatch this trip?')) {
      dispatchMutation.mutate(id);
    }
  };

  const handleComplete = (id: number) => {
    if (window.confirm('Are you sure you want to mark this trip as completed?')) {
      // In a real app, we'd show a form to input actual distance and fuel consumed
      // For now, we'll just call the API with dummy data
      completeMutation.mutate({ id, data: { actual_distance: 100, fuel_consumed: 20 } });
    }
  };

  if (isLoading) return <div className="text-center py-12 text-white/70 animate-fade-in-up">Loading trips...</div>;
  if (error) return <div className="text-center py-12 text-danger animate-fade-in-up">Error loading trips</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-wrap">
        <h1 className="text-2xl font-bold text-white">
          Trip Dispatching
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setSelectedTrip(null);
              setIsEditing(false);
            }}
            className="px-4 py-2 bg-dark-primary text-white rounded-md hover:bg-dark-primary/90 transition-colors duration-300 hover:shadow-glass-hover"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Trip
          </button>
        </div>
      </div>

      {/* Trip Form Modal */}
      {selectedTrip !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel dark bg-white/10 backdrop-blur-lg border border-border/20 rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Trip' : 'Add Trip'}
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
              const tripData = Object.fromEntries(formData.entries()) as Record<string, any>;

              if (tripData.cargo_weight) tripData.cargo_weight = parseFloat(tripData.cargo_weight as string);
              if (tripData.planned_distance) tripData.planned_distance = parseFloat(tripData.planned_distance as string);
              if (tripData.actual_distance) tripData.actual_distance = parseFloat(tripData.actual_distance as string);
              if (tripData.fuel_consumed) tripData.fuel_consumed = parseFloat(tripData.fuel_consumed as string);
              if (tripData.revenue) tripData.revenue = parseFloat(tripData.revenue as string);

              handleSave(tripData);
            }} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Source
                  </label>
                  <input
                    type="text"
                    name="source"
                    required
                    defaultValue={isEditing ? selectedTrip?.source || '' : ''}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    name="destination"
                    required
                    defaultValue={isEditing ? selectedTrip?.destination || '' : ''}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Vehicle
                  </label>
                  <select
                    name="vehicle_id"
                    required
                    defaultValue={isEditing ? selectedTrip?.vehicle_id || '' : ''}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  >
                    <option value="">Select Vehicle</option>
                    {/* In a real app, we'd fetch vehicles here */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Driver
                  </label>
                  <select
                    name="driver_id"
                    required
                    defaultValue={isEditing ? selectedTrip?.driver_id || '' : ''}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  >
                    <option value="">Select Driver</option>
                    {/* In a real app, we'd fetch drivers here */}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Cargo Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="cargo_weight"
                    required
                    min="0"
                    defaultValue={isEditing ? selectedTrip?.cargo_weight || 0 : ''}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Planned Distance (km)
                  </label>
                  <input
                    type="number"
                    name="planned_distance"
                    required
                    min="0"
                    defaultValue={isEditing ? selectedTrip?.planned_distance || 0 : ''}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Revenue ($)
                  </label>
                  <input
                    type="number"
                    name="revenue"
                    required
                    min="0"
                    step="0.01"
                    defaultValue={isEditing ? selectedTrip?.revenue || 0 : ''}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-dark-primary focus:border-dark-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue={isEditing ? selectedTrip?.status || '' : TRIP_STATUSES[0]}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  >
                    {TRIP_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Dispatched At
                  </label>
                  <input
                    type="datetime-local"
                    name="dispatched_at"
                    defaultValue={isEditing ? selectedTrip?.dispatched_at ? new Date(selectedTrip.dispatched_at).toISOString().slice(0, 16) : '' : ''}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-dark-primary focus:border-dark-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Completed At
                  </label>
                  <input
                    type="datetime-local"
                    name="completed_at"
                    defaultValue={isEditing ? selectedTrip?.completed_at ? new Date(selectedTrip.completed_at).toISOString().slice(0, 16) : '' : ''}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-dark-primary focus:border-dark-primary"
                  />
                </div>
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
                  {isEditing ? 'Update Trip' : 'Create Trip'}
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <span className="ml-2 h-4 w-4 border-2 border-white/20 rounded-full animate-spin"></span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trips List with Actions */}
      <div className="glass-panel dark bg-white/5 backdrop-blur-lg border border-border/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-dark-bg/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Cargo Weight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Planned Distance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {trips.map((trip: any) => (
                <tr key={trip.id} className="hover:bg-dark-bg/10 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {trip.source} &rarr; {trip.destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {/* In a real app, we'd show vehicle name */}
                    Vehicle #{trip.vehicle_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {/* In a real app, we'd show driver name */}
                    Driver #{trip.driver_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {trip.cargo_weight?.toLocaleString()} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {trip.planned_distance?.toLocaleString()} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${trip.status === 'Draft' ? 'bg-dark-warning/20 text-dark-warning' : trip.status === 'Dispatched' ? 'bg-dark-info/20 text-dark-info' : trip.status === 'Completed' ? 'bg-dark-success/20 text-dark-success' : 'bg-dark-danger/20 text-dark-danger'}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    ${trip.revenue?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      {trip.status === 'Draft' && (
                        <>
                          <button
                            onClick={() => handleDispatch(trip.id)}
                            className="px-3 py-1 bg-dark-primary text-white text-xs rounded-md hover:bg-dark-primary/90"
                          >
                            Dispatch
                          </button>
                          <button
                            onClick={() => handleEdit(trip)}
                            className="px-3 py-1 text-dark-primary hover:text-white dark:hover:text-dark-primary/90 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(trip.id)}
                            className="px-3 py-1 text-danger hover:text-dark-danger/90 text-xs"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {trip.status === 'Dispatched' && (
                        <>
                          <button
                            onClick={() => handleComplete(trip.id)}
                            className="px-3 py-1 bg-dark-success text-white text-xs rounded-md hover:bg-dark-success/90"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleEdit(trip)}
                            className="px-3 py-1 text-dark-primary hover:text-white dark:hover:text-dark-primary/90 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(trip.id)}
                            className="px-3 py-1 text-danger hover:text-dark-danger/90 text-xs"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {(trip.status === 'Completed' || trip.status === 'Cancelled') && (
                        <button
                          onClick={() => handleEdit(trip)}
                          className="px-3 py-1 text-dark-primary hover:text-white dark:hover:text-dark-primary/90 text-xs"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {trips.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-white/50">
                    No trips found
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

export default Trips;