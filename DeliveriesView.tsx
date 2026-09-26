import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { DeliveryOrder } from '../../types/inventory';
import {
  ArrowUpRight,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Check,
  Building2,
  FileText,
  Truck,
  Printer,
  X
} from 'lucide-react';

interface DeliveriesViewProps {
  onOpenNewDelivery: () => void;
}

export const DeliveriesView: React.FC<DeliveriesViewProps> = ({ onOpenNewDelivery }) => {
  const { deliveries, validateDeliveryOrder, getLocationName, activeWarehouseId, warehouses } = useInventory();
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'waiting' | 'done'>('all');
  const [search, setSearch] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  const filteredDeliveries = deliveries.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;

    // Warehouse filter
    if (activeWarehouseId !== 'all') {
      const wh = warehouses.find(w => w.id === activeWarehouseId);
      if (wh && d.sourceWarehouseId !== activeWarehouseId) {
        const whLocIds = wh.locations.map(l => l.id);
        if (!whLocIds.includes(d.sourceLocationId)) return false;
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchDoc = d.documentNumber.toLowerCase().includes(q);
      const matchCustomer = d.customerName.toLowerCase().includes(q);
      const matchItem = d.lines.some(l => l.productName.toLowerCase().includes(q) || l.sku.toLowerCase().includes(q));
      if (!matchDoc && !matchCustomer && !matchItem) return false;
    }

    return true;
  });

  const handleValidate = (id: string) => {
    const res = validateDeliveryOrder(id);
    setFeedback({ text: res.message, error: !res.success });
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Delivery Orders (Outgoing Goods)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pick, pack, and validate customer shipments. Validation automatically verifies stock and decrements inventory.
          </p>
        </div>

        <button
          onClick={onOpenNewDelivery}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Delivery Order</span>
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
            placeholder="Search by order #, customer, or SKU..."
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
            All ({deliveries.length})
          </button>
          <button
            onClick={() => setStatusFilter('ready')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'ready' ? 'bg-white text-blue-800 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ready to Dispatch ({deliveries.filter(d => d.status === 'ready').length})
          </button>
          <button
            onClick={() => setStatusFilter('waiting')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'waiting' ? 'bg-white text-amber-800 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Awaiting Picking ({deliveries.filter(d => d.status === 'waiting').length})
          </button>
          <button
            onClick={() => setStatusFilter('done')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'done' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Shipped ({deliveries.filter(d => d.status === 'done').length})
          </button>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {filteredDeliveries.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              No delivery orders matching current criteria.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Order Ref</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Pick Location</th>
                  <th className="py-2.5 px-4">Items to Ship</th>
                  <th className="py-2.5 px-4">Tracking #</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeliveries.map(delivery => {
                  const isDone = delivery.status === 'done';
                  const totalUnits = delivery.lines.reduce((s, l) => s + (l.pickedQty || l.orderedQty), 0);

                  return (
                    <tr key={delivery.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {delivery.documentNumber}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{delivery.customerName}</div>
                        {delivery.shippingAddress && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">{delivery.shippingAddress}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{getLocationName(delivery.sourceLocationId)}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {totalUnits} units ({delivery.lines.length} item{delivery.lines.length > 1 ? 's' : ''})
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {delivery.lines.map(l => `${l.pickedQty} ${l.uom} ${l.sku}`).join(', ')}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {delivery.trackingNumber ? (
                          <span className="flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            {delivery.trackingNumber}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            isDone
                              ? 'bg-slate-100 text-slate-700'
                              : delivery.status === 'ready'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-3 h-3 text-slate-600" /> : <Clock className="w-3 h-3" />}
                          <span className="capitalize">{delivery.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(delivery.dateCreated).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedDelivery(delivery)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                            title="View Packing Slip"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {!isDone && (
                            <button
                              type="button"
                              onClick={() => handleValidate(delivery.id)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              <span>Validate (-Stock)</span>
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
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Customer Packing Slip & Bill of Lading</span>
                <h3 className="text-base font-bold text-slate-900 font-mono">{selectedDelivery.documentNumber}</h3>
              </div>
              <button onClick={() => setSelectedDelivery(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg">
              <div>
                <span className="text-slate-500">Customer:</span>
                <p className="font-semibold text-slate-900">{selectedDelivery.customerName}</p>
                <p className="text-[11px] text-slate-500">{selectedDelivery.shippingAddress}</p>
              </div>
              <div>
                <span className="text-slate-500">Pick From:</span>
                <p className="font-semibold text-slate-900">{getLocationName(selectedDelivery.sourceLocationId)}</p>
                <p className="text-[11px] text-slate-500">Tracking: {selectedDelivery.trackingNumber || 'Pending'}</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-semibold uppercase">
                  <tr>
                    <th className="p-2">Item Description</th>
                    <th className="p-2">SKU</th>
                    <th className="p-2 text-right">Ordered</th>
                    <th className="p-2 text-right">Picked & Packed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedDelivery.lines.map((l, i) => (
                    <tr key={i}>
                      <td className="p-2 font-medium">{l.productName}</td>
                      <td className="p-2 font-mono text-slate-600">{l.sku}</td>
                      <td className="p-2 text-right">{l.orderedQty} {l.uom}</td>
                      <td className="p-2 text-right font-bold text-blue-700">{l.pickedQty} {l.uom}</td>
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

              {selectedDelivery.status !== 'done' && (
                <button
                  type="button"
                  onClick={() => {
                    handleValidate(selectedDelivery.id);
                    setSelectedDelivery(null);
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  Validate & Dispatch
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
