import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { DeliveryLine } from '../../types/inventory';
import { X, ArrowUpRight, Plus, Trash2, AlertCircle, Check } from 'lucide-react';

interface NewDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewDeliveryModal: React.FC<NewDeliveryModalProps> = ({ isOpen, onClose }) => {
  const { products, warehouses, createDeliveryOrder, validateDeliveryOrder, getProductStockAtLocation, getLocationName } = useInventory();

  const [customerName, setCustomerName] = useState('Acme Corporation');
  const [shippingAddress, setShippingAddress] = useState('742 Evergreen Terrace, Springfield, OR');
  const [sourceWarehouseId, setSourceWarehouseId] = useState('wh-1');
  const [sourceLocationId, setSourceLocationId] = useState('loc-ms');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [shouldValidateImmediately, setShouldValidateImmediately] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Line items
  const [lines, setLines] = useState<DeliveryLine[]>(() => {
    const chair = products.find(p => p.sku.includes('CHR')) || products[0];
    return chair
      ? [
          {
            productId: chair.id,
            productName: chair.name,
            sku: chair.sku,
            uom: chair.uom,
            orderedQty: 10,
            pickedQty: 10,
            unitPrice: chair.sellingPrice,
          },
        ]
      : [];
  });

  if (!isOpen) return null;

  const currentWh = warehouses.find(w => w.id === sourceWarehouseId) || warehouses[0];

  const handleWarehouseChange = (whId: string) => {
    setSourceWarehouseId(whId);
    const wh = warehouses.find(w => w.id === whId);
    if (wh && wh.locations.length > 0) {
      setSourceLocationId(wh.locations[0].id);
    }
  };

  const handleAddLine = () => {
    const unselected = products.find(p => !lines.some(l => l.productId === p.id)) || products[0];
    if (unselected) {
      setLines(prev => [
        ...prev,
        {
          productId: unselected.id,
          productName: unselected.name,
          sku: unselected.sku,
          uom: unselected.uom,
          orderedQty: 5,
          pickedQty: 5,
          unitPrice: unselected.sellingPrice,
        },
      ]);
    }
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    setLines(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        uom: prod.uom,
        unitPrice: prod.sellingPrice,
      };
      return next;
    });
  };

  const handleQtyChange = (index: number, field: 'orderedQty' | 'pickedQty', val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setLines(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: num,
      };
      return next;
    });
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) return;
    setLines(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('Customer name is required');
      return;
    }
    if (lines.length === 0) {
      setErrorMsg('Please specify at least one product line item to pick and pack');
      return;
    }

    // Check available stock if validating immediately
    if (shouldValidateImmediately) {
      for (const line of lines) {
        const available = getProductStockAtLocation(line.productId, sourceLocationId);
        if (available < line.pickedQty) {
          setErrorMsg(
            `Insufficient stock for ${line.productName} in ${getLocationName(sourceLocationId)}. Available: ${available} ${line.uom}, Picked: ${line.pickedQty} ${line.uom}`
          );
          return;
        }
      }
    }

    const created = createDeliveryOrder({
      customerName: customerName.trim(),
      shippingAddress: shippingAddress.trim(),
      sourceWarehouseId,
      sourceLocationId,
      status: shouldValidateImmediately ? 'ready' : 'ready',
      lines,
      trackingNumber: trackingNumber.trim() || `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      notes: notes.trim(),
    });

    if (shouldValidateImmediately) {
      validateDeliveryOrder(created.id);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-semibold">New Customer Delivery Order (Outgoing Stock)</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customer & Warehouse Source */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer / Client Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="e.g. Nexus Tech Enterprises"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tracking / Courier Ref</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                placeholder="e.g. FEDEX-992014 or leave blank for auto"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Source Warehouse</label>
              <select
                value={sourceWarehouseId}
                onChange={e => handleWarehouseChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({wh.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pick Location / Rack</label>
              <select
                value={sourceLocationId}
                onChange={e => setSourceLocationId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {currentWh?.locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.zone ? `(${loc.zone})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Destination Address</label>
              <input
                type="text"
                value={shippingAddress}
                onChange={e => setShippingAddress(e.target.value)}
                placeholder="City, State"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Line Items List */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Items to Pick & Pack</span>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item Line
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {lines.map((line, idx) => {
                const available = getProductStockAtLocation(line.productId, sourceLocationId);
                const hasSufficient = available >= line.pickedQty;

                return (
                  <div key={idx} className="p-3 grid grid-cols-12 gap-2.5 items-center hover:bg-slate-50/50">
                    <div className="col-span-5">
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[10px] text-slate-500">Product</label>
                        <span className={`text-[10px] font-mono ${hasSufficient ? 'text-emerald-700' : 'text-rose-600 font-bold'}`}>
                          Avail: {available} {line.uom}
                        </span>
                      </div>
                      <select
                        value={line.productId}
                        onChange={e => handleProductChange(idx, e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.sku} - {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] text-slate-500 mb-0.5">Ordered Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={line.orderedQty}
                        onChange={e => handleQtyChange(idx, 'orderedQty', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs font-mono border border-slate-300 rounded focus:outline-none"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] text-slate-500 mb-0.5">Picked / Pack Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={line.pickedQty}
                        onChange={e => handleQtyChange(idx, 'pickedQty', e.target.value)}
                        className={`w-full px-2 py-1.5 text-xs font-mono border rounded focus:outline-none font-bold ${
                          hasSufficient ? 'border-slate-300 text-blue-700' : 'border-rose-400 text-rose-700 bg-rose-50'
                        }`}
                      />
                    </div>

                    <div className="col-span-1 pt-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        disabled={lines.length === 1}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dispatch / Packing Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Palletized and strapped; handle with forklift"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center gap-2">
            <input
              type="checkbox"
              id="validateDeliveryImmediately"
              checked={shouldValidateImmediately}
              onChange={e => setShouldValidateImmediately(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="validateDeliveryImmediately" className="text-xs text-blue-950 font-medium cursor-pointer">
              <strong>Validate & Deduct Stock Immediately</strong> (reduces inventory by {lines.reduce((s, l) => s + l.pickedQty, 0)} units upon confirmation)
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              {shouldValidateImmediately ? 'Create & Validate Dispatch' : 'Create Delivery (Ready)'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
