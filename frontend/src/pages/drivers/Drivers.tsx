import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { Edit2, Trash2, Plus, X } from 'lucide-react';

// Driver license categories and statuses from the backend
const LICENSE_CATEGORIES = ['A', 'B', 'C', 'D', 'E'];
const DRIVER_STATUSES = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

const Drivers: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch drivers
  const { data: drivers = [], isLoading, error } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const response = await api.get('/drivers');
      return response.data;
    }
  });

  // Create driver mutation
  const createMutation = useMutation({
    mutationFn: (driverData: any) => api.post('/drivers', driverData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setSelectedDriver(null);
      setIsEditing(false);
    }
  });

  // Update driver mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/drivers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setSelectedDriver(null);
      setIsEditing(false);
    }
  });

  // Delete driver mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/drivers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setSelectedDriver(null);
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (driver: any) => {
    setSelectedDriver(driver);
    setIsEditing(true);
  };

  const handleSave = (driverData: any) => {
    if (isEditing && selectedDriver?.id) {
      updateMutation.mutate({ id: selectedDriver.id, data: driverData });
    } else {
      createMutation.mutate(driverData);
    }
  };

  const handleCancel = () => {
    setSelectedDriver(null);
    setIsEditing(false);
  };

  if (isLoading) return <div className="text-center py-12 text-white/70 animate-fade-in-up">Loading drivers...</div>;
  if (error) return <div className="text-center py-12 text-danger animate-fade-in-up">Error loading drivers</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-wrap">
        <h1 className="text-2xl font-bold text-white">
          Driver Management
        </h1>
        <button
          onClick={() => {
            setSelectedDriver(null);
            setIsEditing(false);
          }}
          className="px-4 py-2 bg-dark-primary text-white rounded-md hover:bg-dark-primary/90 transition-colors duration-300 hover:shadow-glass-hover"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Driver
        </button>
      </div>

      {/* Driver Form Modal */}
      {selectedDriver !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel dark bg-white/10 backdrop-blur-lg border border-border/20 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Driver' : 'Add Driver'}
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
              const driverData = Object.fromEntries(formData.entries()) as Record<string, any>;

              // Convert date
              if (driverData.license_expiry_date) {
                driverData.license_expiry_date = driverData.license_expiry_date as string;
              }

              handleSave(driverData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={isEditing ? selectedDriver?.name || '' : ''}
                  className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  name="license_number"
                  required
                  defaultValue={isEditing ? selectedDriver?.license_number || '' : ''}
                  className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    License Category
                  </label>
                  <select
                    name="license_category"
                    required
                    defaultValue={isEditing ? selectedDriver?.license_category || '' : LICENSE_CATEGORIES[0]}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  >
                    {LICENSE_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
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
                    defaultValue={isEditing ? selectedDriver?.status || '' : DRIVER_STATUSES[0]}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  >
                    {DRIVER_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  License Expiry Date
                </label>
                <input
                  type="date"
                  name="license_expiry_date"
                  required
                  defaultValue={isEditing ? selectedDriver?.license_expiry_date || '' : ''}
                  className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contact_number"
                    defaultValue={isEditing ? selectedDriver?.contact_number || '' : ''}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Safety Score (0-100)
                  </label>
                  <input
                    type="number"
                    name="safety_score"
                    min="0"
                    max="100"
                    defaultValue={isEditing ? selectedDriver?.safety_score || 100 : ''}
                    className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
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
                  {isEditing ? 'Update Driver' : 'Create Driver'}
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
            Filter by License Category
          </label>
          <select
            className="mt-1 block w-full rounded-lg border border-border/50 bg-dark-bg/60 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus-ring-dark-primary focus:border-dark-primary"
          >
            <option value="">All Categories</option>
            {LICENSE_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
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
            {DRIVER_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="glass-panel dark bg-white/5 backdrop-blur-lg border border-border/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-dark-bg/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  License #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  License Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Safety Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  License Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {drivers.map((driver: any) => (
                <tr key={driver.id} className="hover:bg-dark-bg/10 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {driver.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {driver.license_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-dark-primary/20 text-dark-primary`}>
                      {driver.license_category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${driver.status === 'Available' ? 'bg-dark-success/20 text-dark-success' : driver.status === 'On Trip' ? 'bg-dark-info/20 text-dark-info' : driver.status === 'Off Duty' ? 'bg-dark-warning/20 text-dark-warning' : 'bg-dark-danger/20 text-dark-danger'}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {driver.safety_score?.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {driver.license_expiry_date ? new Date(driver.license_expiry_date).toLocaleDateString() : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                    {driver.contact_number || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(driver)}
                      className="text-dark-primary hover:text-white dark:hover:text-dark-primary/90 mr-3"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(driver.id)}
                      className="text-danger hover:text-dark-danger/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {drivers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-white/50">
                    No drivers found
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

export default Drivers;