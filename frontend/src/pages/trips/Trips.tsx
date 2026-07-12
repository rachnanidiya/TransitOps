import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, X, Pencil, Trash2, Send, CheckCircle2 } from 'lucide-react';

const TRIP_STATUSES = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

export default function Trips() {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => (await api.get('/trips')).data.trips || [],
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/trips', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['trips'] }); setForm(null); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/trips/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['trips'] }); setForm(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/trips/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });
  const dispatchMut = useMutation({
    mutationFn: (id: number) => api.put(`/trips/${id}/dispatch`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });
  const completeMut = useMutation({
    mutationFn: (id: number) => api.put(`/trips/${id}/complete`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const d = Object.fromEntries(fd.entries()) as Record<string, any>;
    d.vehicle_id = parseInt(d.vehicle_id, 10);
    d.driver_id = parseInt(d.driver_id, 10);
    d.cargo_weight = parseFloat(d.cargo_weight);
    d.planned_distance = parseFloat(d.planned_distance);
    d.revenue = parseFloat(d.revenue);
    if (editing && form?.id) updateMut.mutate({ id: form.id, data: d });
    else createMut.mutate(d);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return 'badge-success';
      case 'Dispatched': return 'badge-info';
      case 'Draft': return 'badge-warning';
      case 'Cancelled': return 'badge-danger';
      default: return 'badge-muted';
    }
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center text-slate-500 animate-pulse-soft">Loading trips…</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Trips</h1>
          <p className="text-sm text-slate-500 mt-1">Manage active and past trips</p>
        </div>
        <button onClick={() => { setForm({}); setEditing(false); }} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Trip
        </button>
      </div>

      {/* Modal */}
      {form !== null && (
        <div className="modal-overlay" onClick={() => setForm(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">{editing ? 'Edit Trip' : 'New Trip'}</h2>
              <button onClick={() => setForm(null)} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Source (Origin)</label>
                  <input name="source" required defaultValue={editing ? form?.source : ''} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Destination</label>
                  <input name="destination" required defaultValue={editing ? form?.destination : ''} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Vehicle ID</label>
                  <input name="vehicle_id" type="number" min="1" required defaultValue={editing ? form?.vehicle_id : ''} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Driver ID</label>
                  <input name="driver_id" type="number" min="1" required defaultValue={editing ? form?.driver_id : ''} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Cargo Weight (kg)</label>
                  <input name="cargo_weight" type="number" step="0.1" min="0" required defaultValue={editing ? form?.cargo_weight : ''} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Planned Distance (km)</label>
                  <input name="planned_distance" type="number" step="0.1" min="0" required defaultValue={editing ? form?.planned_distance : ''} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Revenue (₹)</label>
                  <input name="revenue" type="number" step="0.01" min="0" required defaultValue={editing ? form?.revenue : ''} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                  <select name="status" required defaultValue={editing ? form?.status : TRIP_STATUSES[0]} className="input">
                    {TRIP_STATUSES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
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
              <th>Route</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Cargo</th>
              <th>Distance</th>
              <th>Revenue</th>
              <th>Status</th>
              <th className="text-right min-w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t: any) => (
              <tr key={t.id}>
                <td className="font-medium text-white">
                  {t.source} <span className="text-slate-500 mx-1">→</span> {t.destination}
                </td>
                <td>#{t.vehicle_id}</td>
                <td>#{t.driver_id}</td>
                <td>{t.cargo_weight} kg</td>
                <td>{t.planned_distance} km</td>
                <td className="text-emerald-400 font-semibold">₹{t.revenue?.toFixed(2)}</td>
                <td><span className={`badge ${getStatusBadge(t.status)}`}>{t.status}</span></td>
                <td className="text-right flex items-center justify-end gap-1">
                  {t.status === 'Draft' && (
                    <button onClick={() => { if (confirm('Dispatch this trip?')) dispatchMut.mutate(t.id); }} className="px-2 py-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded text-xs font-medium mr-1 transition-colors flex items-center gap-1">
                      <Send className="w-3 h-3" /> Dispatch
                    </button>
                  )}
                  {t.status === 'Dispatched' && (
                    <button onClick={() => { if (confirm('Complete this trip?')) completeMut.mutate(t.id); }} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded text-xs font-medium mr-1 transition-colors flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Complete
                    </button>
                  )}
                  <button onClick={() => { setForm(t); setEditing(true); }} className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {t.status !== 'Completed' && (
                    <button onClick={() => { if (confirm('Delete this trip?')) deleteMut.mutate(t.id); }} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {trips.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-slate-500">No trips recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
