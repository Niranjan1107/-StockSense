import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  SlidersHorizontal,
  Plus,
  Search,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { AdjustmentReason } from '../../types/inventory';

interface AdjustmentsViewProps {
  onOpenNewAdjustment: () => void;
}

export const AdjustmentsView: React.FC<AdjustmentsViewProps> = ({ onOpenNewAdjustment }) => {
  const { adjustments, getLocationName, activeWarehouseId, warehouses } = useInventory();
  const [reasonFilter, setReasonFilter] = useState<'all' | AdjustmentReason>('all');
  const [search, setSearch] = useState('');

  const filteredAdjustments = adjustments.filter(adj => {
    if (reasonFilter !== 'all' && adj.reason !== reasonFilter) return false;

    // Warehouse filter
    if (activeWarehouseId !== 'all') {
      const wh = warehouses.find(w => w.id === activeWarehouseId);
      if (wh && adj.warehouseId !== activeWarehouseId) {
        const whLocIds = wh.locations.map(l => l.id);
        if (!whLocIds.includes(adj.locationId)) return false;
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchDoc = adj.documentNumber.toLowerCase().includes(q);
      const matchProduct = adj.productName.toLowerCase().includes(q);
      const matchSku = adj.sku.toLowerCase().includes(q);
      const matchNotes = adj.notes?.toLowerCase().includes(q);
      if (!matchDoc && !matchProduct && !matchSku && !matchNotes) return false;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Stock Adjustments & Physical Count Audits</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Resolve variances between recorded system stock and actual physical shelf counts (damages, shrinkage, audit corrections).
          </p>
        </div>

        <button
          onClick={onOpenNewAdjustment}
          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Stock Adjustment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex-1 max-w-sm relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by doc #, product, or reason..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <label className="text-slate-500 font-medium">Reason:</label>
          <select
            value={reasonFilter}
            onChange={e => setReasonFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
          >
            <option value="all">All Reasons</option>
            <option value="damaged">Damaged Goods</option>
            <option value="spoilage">Spoilage</option>
            <option value="theft_loss">Theft / Loss</option>
            <option value="found_cycle_count">Found Stock</option>
            <option value="annual_audit">Annual Audit</option>
            <option value="data_correction">Data Correction</option>
          </select>
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {filteredAdjustments.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              No stock adjustment records found matching your filter.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Adjustment Doc</th>
                  <th className="py-2.5 px-4">Product / SKU</th>
                  <th className="py-2.5 px-4">Audited Location</th>
                  <th className="py-2.5 px-4">System Recorded</th>
                  <th className="py-2.5 px-4">Physical Counted</th>
                  <th className="py-2.5 px-4">Difference Delta</th>
                  <th className="py-2.5 px-4">Reason & Notes</th>
                  <th className="py-2.5 px-4">Auditor</th>
                  <th className="py-2.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdjustments.map(adj => {
                  const isNeg = adj.differenceQty < 0;
                  const isPos = adj.differenceQty > 0;

                  return (
                    <tr key={adj.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {adj.documentNumber}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{adj.productName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{adj.sku}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{getLocationName(adj.locationId)}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {adj.recordedQty} {adj.uom}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {adj.countedQty} {adj.uom}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            isNeg
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isPos
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isNeg && <TrendingDown className="w-3 h-3 text-rose-600" />}
                          {isPos && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                          <span>{isPos ? `+${adj.differenceQty}` : adj.differenceQty} {adj.uom}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 capitalize">
                          {adj.reason.replace(/_/g, ' ')}
                        </div>
                        {adj.notes && (
                          <div className="text-[11px] text-slate-500 truncate">{adj.notes}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {adj.createdBy}
                      </td>

                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(adj.createdAt).toLocaleDateString()}
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
