import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';

const EXPENSE_TYPES = ['Toll', 'Parking', 'Driver Meals', 'Insurance', 'Permits', 'Other'];

export default function Expenses() {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => (await api.get('/expenses')).data.expenses || [],
  });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/expenses', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); setForm(null); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/expenses/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); setForm(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/expenses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const d = Object.fromEntries(fd.entries()) as Record<string, any>;
    d.amount = parseFloat(d.amount);
    if (editing && form?.id) updateMut.mutate({ id: form.id, data: d });
    else createMut.mutate(d);
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center text-slate-500 animate-pulse-soft">Loading expenses…</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Expenses</h1>
          <p className="text-sm text-slate-500 mt-1">Track and manage operational expenses</p>
        </div>
        <button onClick={() => { setForm({}); setEditing(false); }} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Modal */}
      {form !== null && (
        <div className="modal-overlay" onClick={() => setForm(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">{editing ? 'Edit Expense' : 'New Expense'}</h2>
              <button onClick={() => setForm(null)} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
                <select name="expense_type" required defaultValue={editing ? form?.expense_type : EXPENSE_TYPES[0]} className="input">
                  {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount (₹)</label>
                <input name="amount" type="number" step="0.01" min="0" required defaultValue={editing ? form?.amount : ''} className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Vehicle ID</label>
                <input name="vehicle_id" type="number" min="1" required defaultValue={editing ? form?.vehicle_id : ''} className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Trip ID (optional)</label>
                <input name="trip_id" type="number" min="1" defaultValue={editing ? form?.trip_id : ''} className="input" />
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
              <th>Type</th>
              <th>Amount</th>
              <th>Vehicle</th>
              <th>Trip</th>
              <th>Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp: any) => (
              <tr key={exp.id}>
                <td><span className="badge badge-info">{exp.expense_type}</span></td>
                <td className="font-medium text-white">₹{exp.amount?.toFixed(2)}</td>
                <td>Vehicle #{exp.vehicle_id}</td>
                <td>{exp.trip_id ? `Trip #${exp.trip_id}` : '—'}</td>
                <td>{exp.date_logged ? new Date(exp.date_logged).toLocaleDateString() : '—'}</td>
                <td className="text-right">
                  <button onClick={() => { setForm(exp); setEditing(true); }} className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if (confirm('Delete this expense?')) deleteMut.mutate(exp.id); }} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors ml-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-slate-500">No expenses recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
