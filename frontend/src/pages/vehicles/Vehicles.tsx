import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';

const VEHICLE_TYPES = ['Truck', 'Van', 'Bus', 'Car'];
const VEHICLE_STATUSES = ['Available', 'On Trip', 'In Shop', 'Retired'];

export default function Vehicles() {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => (await api.get('/vehicles')).data.vehicles || [],
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/vehicles', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); setForm(null); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/vehicles/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); setForm(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/vehicles/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const d = Object.fromEntries(fd.entries()) as Record<string, any>;
    d.max_load_capacity = parseFloat(d.max_load_capacity);
    d.acquisition_cost = parseFloat(d.acquisition_cost);
    d.odometer = parseFloat(d.odometer);
    if (editing && form?.id) updateMut.mutate({ id: form.id, data: d });
    else createMut.mutate(d);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available': return 'badge-success';
      case 'On Trip': return 'badge-info';
      case 'In Shop': return 'badge-warning';
      case 'Retired': return 'badge-danger';
      default: return 'badge-muted';
    }
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center text-slate-500 animate-pulse-soft">Loading vehicles…</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vehicles</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your fleet</p>
        </div>
        <button onClick={() => { setForm({}); setEditing(false); }} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {/* Modal */}
      {form !== null && (
        <div className="modal-overlay" onClick={() => setForm(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">{editing ? 'Edit Vehicle' : 'New Vehicle'}</h2>
              <button onClick={() => setForm(null)} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Registration Number</label>
                  <input name="registration_number" required defaultValue={editing ? form?.reg_number || form?.registration_number : ''} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Model Name</label>
                  <input name="name_model" required defaultValue={editing ? form?.name_model : ''} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
                  <select name="type" required defaultValue={editing ? form?.type : VEHICLE_TYPES[0]} className="input">
                    {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                  <select name="status" required defaultValue={editing ? form?.status : VEHICLE_STATUSES[0]} className="input">
                    {VEHICLE_STATUSES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Capacity (kg)</label>
                  <input name="max_load_capacity" type="number" step="0.1" min="0" required defaultValue={editing ? form?.capacity_kg || form?.max_load_capacity : ''} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Acquisition Cost (₹)</label>
                  <input name="acquisition_cost" type="number" step="0.01" min="0" required defaultValue={editing ? form?.acquisition_cost : ''} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Odometer (km)</label>
                  <input name="odometer" type="number" step="0.1" min="0" required defaultValue={editing ? form?.odometer : ''} className="input" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setForm(null)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="btn btn-primary disabled:opacity-50">
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Registration</th>
              <th>Model</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Odometer</th>
              <th>Cost</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v: any) => (
              <tr key={v.id}>
                <td className="font-medium text-white">{v.reg_number || v.registration_number}</td>
                <td>{v.name_model || '—'}</td>
                <td>{v.type}</td>
                <td>{v.capacity_kg || v.max_load_capacity} kg</td>
                <td>{v.odometer} km</td>
                <td>₹{v.acquisition_cost?.toFixed(2)}</td>
                <td><span className={`badge ${getStatusBadge(v.status)}`}>{v.status}</span></td>
                <td className="text-right">
                  <button onClick={() => { setForm(v); setEditing(true); }} className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if (confirm('Delete this vehicle?')) deleteMut.mutate(v.id); }} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors ml-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-slate-500">No vehicles registered yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
