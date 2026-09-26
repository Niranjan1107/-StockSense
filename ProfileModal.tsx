import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { X, User, Building2, Shield, Mail, Check } from 'lucide-react';
import { Role } from '../../types/inventory';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile, switchDemoRole } = useAuth();
  const { warehouses } = useInventory();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [role, setRole] = useState<Role>(currentUser?.role || 'inventory_manager');
  const [assignedWarehouseId, setAssignedWarehouseId] = useState(currentUser?.assignedWarehouseId || 'wh-1');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      role,
      assignedWarehouseId,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold">User Profile & Permissions</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              Profile updated successfully!
            </div>
          )}

          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-700 text-lg">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{currentUser.name}</h3>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {currentUser.role === 'inventory_manager' ? 'Inventory Manager (Admin)' : 'Warehouse Staff (Operations)'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              System Role & Responsibilities
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('inventory_manager')}
                className={`p-3 text-left border rounded-lg transition-all ${
                  role === 'inventory_manager'
                    ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-xs text-slate-900">Inventory Manager</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Full control: create products, approve receipts, deliveries, transfers, adjustments.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('warehouse_staff')}
                className={`p-3 text-left border rounded-lg transition-all ${
                  role === 'warehouse_staff'
                    ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-xs text-slate-900">Warehouse Staff</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Floor operations: execute transfers, picking/shelving, counts, damage reporting.
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              Primary Station / Assigned Warehouse
            </label>
            <select
              value={assignedWarehouseId}
              onChange={e => setAssignedWarehouseId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} ({wh.code})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Switching role affects operational validation capabilities.
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
