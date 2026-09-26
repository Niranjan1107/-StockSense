import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  History,
  Download,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Building2,
  Calendar,
  Filter,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { DocumentType } from '../../types/inventory';

export const MoveHistoryView: React.FC = () => {
  const { moveHistory, exportLedgerToCsv, categories, products } = useInventory();
  const [docTypeFilter, setDocTypeFilter] = useState<'all' | DocumentType>('all');
  const [search, setSearch] = useState('');

  const filteredHistory = moveHistory.filter(item => {
    if (docTypeFilter !== 'all' && item.documentType !== docTypeFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchDoc = item.documentNumber.toLowerCase().includes(q);
      const matchProd = item.productName.toLowerCase().includes(q);
      const matchSku = item.sku.toLowerCase().includes(q);
      const matchFrom = item.fromLocationName?.toLowerCase().includes(q);
      const matchTo = item.toLocationName?.toLowerCase().includes(q);
      const matchBy = item.performedBy.toLowerCase().includes(q);
      if (!matchDoc && !matchProd && !matchSku && !matchFrom && !matchTo && !matchBy) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Stock Ledger & Movement History</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable chronological audit log capturing every single stock receipt, dispatch, relocation, and adjustment.
          </p>
        </div>

        <button
          onClick={exportLedgerToCsv}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex-1 max-w-sm relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by reference #, SKU, or user..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
          <button
            onClick={() => setDocTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              docTypeFilter === 'all' ? 'bg-white text-slate-950 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Ledger ({moveHistory.length})
          </button>
          <button
            onClick={() => setDocTypeFilter('receipt')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              docTypeFilter === 'receipt' ? 'bg-white text-emerald-800 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Receipts
          </button>
          <button
            onClick={() => setDocTypeFilter('delivery')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              docTypeFilter === 'delivery' ? 'bg-white text-blue-800 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Deliveries
          </button>
          <button
            onClick={() => setDocTypeFilter('transfer')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              docTypeFilter === 'transfer' ? 'bg-white text-amber-800 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Transfers
          </button>
          <button
            onClick={() => setDocTypeFilter('adjustment')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              docTypeFilter === 'adjustment' ? 'bg-white text-purple-800 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Adjustments
          </button>
        </div>
      </div>

      {/* Ledger Table with exact required columns: Date, Reference, Product, Movement Type, Source, Destination, Quantity, User, Status */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span>Stock ledger is empty or no records match the criteria.</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map(entry => {
                  const isPositive = entry.quantityChange > 0;
                  const isNegative = entry.quantityChange < 0;

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Date */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap text-[11px]">
                        {new Date(entry.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                        })}
                      </td>

                      {/* 2. Reference */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {entry.documentNumber}
                        </span>
                      </td>

                      {/* 3. Product */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900">{entry.productName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{entry.sku}</div>
                      </td>

                      {/* 4. Movement Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 font-semibold capitalize text-xs">
                          {entry.documentType === 'receipt' && (
                            <>
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-800">Receipt</span>
                            </>
                          )}
                          {entry.documentType === 'delivery' && (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-blue-800">Delivery</span>
                            </>
                          )}
                          {entry.documentType === 'transfer' && (
                            <>
                              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-amber-800">Transfer</span>
                            </>
                          )}
                          {entry.documentType === 'adjustment' && (
                            <>
                              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                              <span className="text-purple-800">Adjustment</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* 5. Source */}
                      <td className="py-3.5 px-4 text-slate-700 max-w-[140px] truncate" title={entry.fromLocationName || 'Vendor Intake'}>
                        {entry.fromLocationName || 'Vendor Intake'}
                      </td>

                      {/* 6. Destination */}
                      <td className="py-3.5 px-4 text-slate-900 font-medium max-w-[140px] truncate" title={entry.toLocationName || 'Customer Dispatch'}>
                        {entry.toLocationName || 'Customer Dispatch'}
                      </td>

                      {/* 7. Quantity */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-xs">
                        <span
                          className={
                            isPositive
                              ? 'text-emerald-700'
                              : isNegative
                              ? 'text-rose-700'
                              : 'text-slate-700'
                          }
                        >
                          {isPositive ? `+${entry.quantityChange}` : entry.quantityChange} {entry.uom}
                        </span>
                      </td>

                      {/* 8. User */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {entry.performedBy}
                      </td>

                      {/* 9. Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Logged</span>
                        </span>
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
