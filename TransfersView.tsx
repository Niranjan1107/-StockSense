import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  ArrowLeftRight,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Check,
  Building2,
  ArrowRight
} from 'lucide-react';

interface TransfersViewProps {
  onOpenNewTransfer: () => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({ onOpenNewTransfer }) => {
  const { transfers, validateTransfer, getLocationName, activeWarehouseId, warehouses } = useInventory();
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'waiting' | 'done'>('all');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  const filteredTransfers = transfers.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;

    // Warehouse filter
    if (activeWarehouseId !== 'all') {
      const wh = warehouses.find(w => w.id === activeWarehouseId);
      if (wh) {
        const whLocIds = wh.locations.map(l => l.id);
        const matchSrc = t.sourceWarehouseId === activeWarehouseId || whLocIds.includes(t.sourceLocationId);
        const matchDst = t.destWarehouseId === activeWarehouseId || whLocIds.includes(t.destLocationId);
        if (!matchSrc && !matchDst) return false;
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchDoc = t.documentNumber.toLowerCase().includes(q);
      const matchReason = t.reason?.toLowerCase().includes(q);
      const matchItem = t.lines.some(l => l.productName.toLowerCase().includes(q) || l.sku.toLowerCase().includes(q));
      if (!matchDoc && !matchReason && !matchItem) return false;
    }

    return true;
  });

  const handleValidate = (id: string) => {
    const res = validateTransfer(id);
    setFeedback({ text: res.message, error: !res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Internal Transfers</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Relocate stock between warehouses, racks, and production floors (e.g. Main Store → Production Rack).
          </p>
        </div>

        <button
          onClick={onOpenNewTransfer}
          className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Stock Transfer</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between ${
            feedback.error ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)}>✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 max-w-sm relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by transfer #, reason, or SKU..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({transfers.length})
          </button>
          <button
            onClick={() => setStatusFilter('ready')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'ready' ? 'bg-white text-amber-800 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ready to Move ({transfers.filter(t => t.status === 'ready').length})
          </button>
          <button
            onClick={() => setStatusFilter('done')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'done' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({transfers.filter(t => t.status === 'done').length})
          </button>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {filteredTransfers.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              No internal transfer records matching current criteria.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Transfer Ref</th>
                  <th className="py-2.5 px-4">Origin → Destination</th>
                  <th className="py-2.5 px-4">Items Moved</th>
                  <th className="py-2.5 px-4">Operational Reason</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransfers.map(trf => {
                  const isDone = trf.status === 'done';
                  const totalUnits = trf.lines.reduce((s, l) => s + l.quantity, 0);

                  return (
                    <tr key={trf.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {trf.documentNumber}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <span>{getLocationName(trf.sourceLocationId)}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-amber-700 font-semibold">{getLocationName(trf.destLocationId)}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {totalUnits} units ({trf.lines.length} item{trf.lines.length > 1 ? 's' : ''})
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {trf.lines.map(l => `${l.quantity} ${l.uom} ${l.sku}`).join(', ')}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {trf.reason || 'Inventory rebalancing'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            isDone
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-3 h-3 text-slate-600" /> : <Clock className="w-3 h-3" />}
                          <span className="capitalize">{trf.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(trf.dateCreated).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {!isDone ? (
                          <button
                            type="button"
                            onClick={() => handleValidate(trf.id)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-xs inline-flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            <span>Execute Relocation</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Relocated</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
