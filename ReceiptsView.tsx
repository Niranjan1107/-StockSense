import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Receipt } from '../../types/inventory';
import {
  ArrowDownLeft,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Check,
  Building2,
  FileText,
  Printer,
  X
} from 'lucide-react';

interface ReceiptsViewProps {
  onOpenNewReceipt: () => void;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({ onOpenNewReceipt }) => {
  const { receipts, validateReceipt, getLocationName, activeWarehouseId, warehouses } = useInventory();
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'waiting' | 'done'>('all');
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  const filteredReceipts = receipts.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;

    // Warehouse filter
    if (activeWarehouseId !== 'all') {
      const wh = warehouses.find(w => w.id === activeWarehouseId);
      if (wh && r.targetWarehouseId !== activeWarehouseId) {
        const whLocIds = wh.locations.map(l => l.id);
        if (!whLocIds.includes(r.targetLocationId)) return false;
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchDoc = r.documentNumber.toLowerCase().includes(q);
      const matchSupplier = r.supplierName.toLowerCase().includes(q);
      const matchItem = r.lines.some(l => l.productName.toLowerCase().includes(q) || l.sku.toLowerCase().includes(q));
      if (!matchDoc && !matchSupplier && !matchItem) return false;
    }

    return true;
  });

  const handleValidate = (id: string) => {
    const res = validateReceipt(id);
    setFeedback({ text: res.message, error: !res.success });
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Receipts (Incoming Goods)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Process supplier deliveries, verify quantities received, and automatically credit warehouse stock.
          </p>
        </div>

        <button
          onClick={onOpenNewReceipt}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Goods Receipt</span>
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
            placeholder="Search by receipt #, supplier, or SKU..."
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
            All ({receipts.length})
          </button>
          <button
            onClick={() => setStatusFilter('ready')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'ready' ? 'bg-white text-emerald-800 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ready / Arrived ({receipts.filter(r => r.status === 'ready').length})
          </button>
          <button
            onClick={() => setStatusFilter('waiting')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'waiting' ? 'bg-white text-amber-800 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Waiting ({receipts.filter(r => r.status === 'waiting').length})
          </button>
          <button
            onClick={() => setStatusFilter('done')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'done' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Done ({receipts.filter(r => r.status === 'done').length})
          </button>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {filteredReceipts.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              No receipt documents matching your filter.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Receipt Ref</th>
                  <th className="py-2.5 px-4">Vendor / Supplier</th>
                  <th className="py-2.5 px-4">Target Bay / Location</th>
                  <th className="py-2.5 px-4">Items Received</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Date Created</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceipts.map(receipt => {
                  const isDone = receipt.status === 'done';
                  const totalUnits = receipt.lines.reduce((s, l) => s + (l.receivedQty || l.orderedQty), 0);

                  return (
                    <tr key={receipt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {receipt.documentNumber}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{receipt.supplierName}</div>
                        {receipt.notes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">{receipt.notes}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{getLocationName(receipt.targetLocationId)}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {totalUnits} units ({receipt.lines.length} item{receipt.lines.length > 1 ? 's' : ''})
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {receipt.lines.map(l => `${l.receivedQty} ${l.uom} ${l.sku}`).join(', ')}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            isDone
                              ? 'bg-slate-100 text-slate-700'
                              : receipt.status === 'ready'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-3 h-3 text-slate-600" /> : <Clock className="w-3 h-3" />}
                          <span className="capitalize">{receipt.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(receipt.dateCreated).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(receipt)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                            title="View Slip"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {!isDone && (
                            <button
                              type="button"
                              onClick={() => handleValidate(receipt.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              <span>Validate (+Stock)</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slip Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Vendor Goods Receiving Note</span>
                <h3 className="text-base font-bold text-slate-900 font-mono">{selectedReceipt.documentNumber}</h3>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg">
              <div>
                <span className="text-slate-500">Supplier:</span>
                <p className="font-semibold text-slate-900">{selectedReceipt.supplierName}</p>
              </div>
              <div>
                <span className="text-slate-500">Target Bay:</span>
                <p className="font-semibold text-slate-900">{getLocationName(selectedReceipt.targetLocationId)}</p>
              </div>
              <div>
                <span className="text-slate-500">Status:</span>
                <p className="font-semibold capitalize text-slate-900">{selectedReceipt.status}</p>
              </div>
              <div>
                <span className="text-slate-500">Date:</span>
                <p className="font-semibold text-slate-900">{new Date(selectedReceipt.dateCreated).toLocaleString()}</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-semibold uppercase">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2">SKU</th>
                    <th className="p-2 text-right">Ordered</th>
                    <th className="p-2 text-right">Received</th>
                    <th className="p-2 text-right">Unit Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedReceipt.lines.map((l, i) => (
                    <tr key={i}>
                      <td className="p-2 font-medium">{l.productName}</td>
                      <td className="p-2 font-mono text-slate-600">{l.sku}</td>
                      <td className="p-2 text-right">{l.orderedQty} {l.uom}</td>
                      <td className="p-2 text-right font-bold text-emerald-700">{l.receivedQty} {l.uom}</td>
                      <td className="p-2 text-right">${l.unitCost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Slip
              </button>

              {selectedReceipt.status !== 'done' && (
                <button
                  type="button"
                  onClick={() => {
                    handleValidate(selectedReceipt.id);
                    setSelectedReceipt(null);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  Validate & Post to Ledger
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
