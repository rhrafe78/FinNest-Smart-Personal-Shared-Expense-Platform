import React, { useState, useEffect } from 'react';
import { Tags, Plus, Trash2, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../../api/client';
import { Button } from '../../components/ui/Button';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState({
    name: '',
    type: 'expense',
    color: '#6366f1',
    icon: 'tag',
  });
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/platform-admin/categories/');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;

    setAdding(true);
    setMessage('');
    try {
      const res = await api.post('/platform-admin/categories/', newCat);
      setCategories([...categories, res.data]);
      setNewCat({ name: '', type: 'expense', color: '#6366f1', icon: 'tag' });
      setMessage('New global system category added successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create category.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this system category?')) return;

    try {
      await api.delete(`/platform-admin/categories/?id=${id}`);
      setCategories(categories.filter((c) => c.id !== id));
      setMessage('Category deleted.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert('Failed to delete category.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Tags className="w-6 h-6 text-purple-400" />
          System Category Management
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize standard system categories available to all users across personal finance ledgers
        </p>
      </div>

      {message && (
        <div className="p-3 text-xs bg-emerald-950/60 text-emerald-300 rounded-xl border border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Add New Category Form Card */}
      <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-purple-400" />
          Create New Global Category
        </h3>

        <form onSubmit={handleCreateCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <input
              type="text"
              required
              placeholder="Category Name (e.g. Education, Fitness)"
              value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <select
              value={newCat.type}
              onChange={(e) => setNewCat({ ...newCat, type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="expense">Expense Category</option>
              <option value="income">Income Category</option>
            </select>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-bold bg-purple-600 hover:bg-purple-500 text-white"
              isLoading={adding}
            >
              Add Category
            </Button>
          </div>
        </form>
      </div>

      {/* Categories Grid */}
      <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Active Global Categories ({categories.length})</h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl text-xs font-bold ${
                    c.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {c.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{c.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{c.type}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteCategory(c.id)}
                  title="Delete category"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
