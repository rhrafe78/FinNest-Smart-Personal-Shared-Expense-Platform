import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Check, CheckCircle2, DollarSign, ArrowRight, Trash2, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { CreateHouseholdModal } from '../../components/modals/CreateHouseholdModal';

export const GroceriesPage = () => {
  const { user, currency } = useAuth();
  const [households, setHouseholds] = useState([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState('');
  const [groceryLists, setGroceryLists] = useState([]);
  const [loading, setLoading] = useState(true);

  // New list modal
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('Weekly Mess Market List');

  // Create household modal
  const [showCreateHouseholdModal, setShowCreateHouseholdModal] = useState(false);

  // Add item form
  const [activeListId, setActiveListId] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('1 unit');
  const [itemEst, setItemEst] = useState('');

  const fetchHouseholds = async () => {
    try {
      const res = await api.get('/households/');
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setHouseholds(list);
      if (list.length > 0) {
        setSelectedHouseholdId((prev) => prev || list[0].id);
      } else {
        setSelectedHouseholdId('');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchGroceryLists = async (hhId) => {
    if (!hhId) {
      setGroceryLists([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/groceries/?household=${hhId}`);
      setGroceryLists(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  useEffect(() => {
    if (selectedHouseholdId) {
      fetchGroceryLists(selectedHouseholdId);
    }
  }, [selectedHouseholdId]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!selectedHouseholdId) {
      setShowCreateHouseholdModal(true);
      return;
    }
    try {
      await api.post('/groceries/', {
        household: selectedHouseholdId,
        name: newListName,
      });
      setShowNewListModal(false);
      fetchGroceryLists(selectedHouseholdId);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create grocery list.');
    }
  };

  const handleAddItem = async (listId) => {
    if (!itemName) return;
    try {
      await api.post('/groceries/items/', {
        grocery_list: listId,
        name: itemName,
        quantity: itemQty,
        estimated_price: itemEst || '0.00',
        actual_price: '0.00',
      });
      setItemName('');
      setItemQty('1 unit');
      setItemEst('');
      fetchGroceryLists(selectedHouseholdId);
    } catch (err) {
      alert('Failed to add grocery item.');
    }
  };

  const handleToggleItemPurchased = async (item) => {
    const actual = !item.is_purchased
      ? prompt(`Enter actual purchase cost for ${item.name}:`, item.estimated_price || '0')
      : null;

    try {
      await api.post(`/groceries/items/${item.id}/toggle-purchased/`, {
        actual_price: actual || item.estimated_price,
      });
      fetchGroceryLists(selectedHouseholdId);
    } catch (err) {
      alert('Failed to update item status.');
    }
  };

  const handleConvertToExpense = async (listId) => {
    if (!window.confirm('Convert this grocery checklist into a shared household expense? This will automatically split the total among all roommates.')) {
      return;
    }
    try {
      const res = await api.post(`/groceries/${listId}/convert-to-expense/`);
      alert(res.data.message || 'Converted to shared expense successfully!');
      fetchGroceryLists(selectedHouseholdId);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to convert grocery list to expense.');
    }
  };

  const curr = currency === 'BDT' ? '৳' : '$';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Household Groceries & Shopping Lists
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Collaborative grocery checklists with flatmates and 1-tap split expense conversion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {households.length > 0 ? (
            <>
              <select
                value={selectedHouseholdId}
                onChange={(e) => setSelectedHouseholdId(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
              >
                {households.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>

              <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowNewListModal(true)}>
                New Grocery List
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setShowCreateHouseholdModal(true)}
            >
              + Create Household
            </Button>
          )}
        </div>
      </div>

      {households.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
            <Home className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Household Found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Create or join a household to start managing shared groceries with roommates.
            </p>
          </div>
          <div className="pt-2">
            <Button variant="primary" icon={Plus} onClick={() => setShowCreateHouseholdModal(true)}>
              + Create Household
            </Button>
          </div>
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
          Loading grocery lists...
        </div>
      ) : groceryLists.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-3">
          <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No grocery lists created yet</h3>
          <p className="text-xs text-slate-500">Create a weekly grocery checklist for your roommates.</p>
          <div className="pt-2">
            <Button variant="outline" size="sm" icon={Plus} onClick={() => setShowNewListModal(true)}>
              Create Grocery List
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {groceryLists.map((list) => (
            <div
              key={list.id}
              className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {list.name}
                    </h3>
                    <Badge variant={list.is_completed ? 'success' : 'brand'}>
                      {list.is_completed ? 'Converted to Shared Expense' : 'In Progress'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {list.completed_items_count} of {list.items_count} items bought
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Total Cost</span>
                    <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {curr} {parseFloat(list.total_actual > 0 ? list.total_actual : list.total_estimated).toLocaleString()}
                    </span>
                  </div>

                  {!list.is_completed && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ArrowRight}
                      onClick={() => handleConvertToExpense(list.id)}
                    >
                      Convert to Shared Expense
                    </Button>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold">Item</th>
                      <th className="py-2.5 px-3 font-semibold">Quantity</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Est. Cost</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Actual Cost</th>
                      <th className="py-2.5 px-3 font-semibold">Purchased By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {list.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleItemPurchased(item)}
                            className={`p-1 rounded-lg transition-colors ${
                              item.is_purchased
                                ? 'bg-emerald-500 text-white'
                                : 'border border-slate-300 dark:border-slate-700 text-transparent hover:border-slate-500'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className={`py-3 px-3 font-medium ${item.is_purchased ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {item.name}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-500">
                          {curr} {parseFloat(item.estimated_price).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {parseFloat(item.actual_price) > 0 ? `${curr} ${parseFloat(item.actual_price).toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                          {item.purchased_by_detail?.full_name || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Item Row */}
              {!list.is_completed && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    placeholder="New item (e.g. Cooking Oil 5L, Eggs)..."
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <input
                    type="text"
                    placeholder="Qty (e.g. 5 kg)"
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                    className="w-28 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Est. ৳"
                    value={itemEst}
                    onChange={(e) => setItemEst(e.target.value)}
                    className="w-24 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <Button variant="secondary" size="sm" onClick={() => handleAddItem(list.id)}>
                    Add Item
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create List Modal */}
      <Modal isOpen={showNewListModal} onClose={() => setShowNewListModal(false)} title="Create New Grocery List">
        <form onSubmit={handleCreateList} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              List Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Weekly Bazar List, Ramadan Grocery"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowNewListModal(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create List
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Household Modal */}
      <CreateHouseholdModal
        isOpen={showCreateHouseholdModal}
        onClose={() => setShowCreateHouseholdModal(false)}
        onSuccess={fetchHouseholds}
      />
    </div>
  );
};
