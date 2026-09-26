import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { TransferLine } from '../../types/inventory';
import { X, ArrowLeftRight, Plus, Trash2, AlertCircle, Check } from 'lucide-react';

interface NewTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTransferModal: React.FC<NewTransferModalProps> = ({ isOpen, onClose }) => {
  const {
    products,
    warehouses,
    createTransfer,
    validateTransfer,
    getProductStockAtLocation,
    getLocationName,
  } = useInventory();
  const { currentUser } = useAuth();

  // Source selection (Default: Main Store)
  const [sourceWarehouseId, setSourceWarehouseId] = useState('wh-1');
  const [sourceLocationId, setSourceLocationId] = useState('loc-ms');

  // Destination selection (Default: Production Rack)
  const [destWarehouseId, setDestWarehouseId] = useState('wh-2');
  const [destLocationId, setDestLocationId] = useState('loc-pr');

  const [reason, setReason] = useState('Move to production rack for scheduled assembly');
  const [shouldValidateImmediately, setShouldValidateImmediately] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Line items
  const [lines, setLines] = useState<TransferLine[]>(() => {
    const steel = products.find(p => p.sku.includes('STL')) || products[0];
    return steel
      ? [
          {
            productId: steel.id,
            productName: steel.name,
            sku: steel.sku,
            uom: steel.uom,
            quantity: 20,
          },
        ]
      : [];
  });

  if (!isOpen) return null;

  const srcWh = warehouses.find(w => w.id === sourceWarehouseId) || warehouses[0];
  const destWh = warehouses.find(w => w.id === destWarehouseId) || warehouses[0];

  const handleSourceWhChange = (whId: string) => {
    setSourceWarehouseId(whId);
    const wh = warehouses.find(w => w.id === whId);
    if (wh && wh.locations.length > 0) {
      setSourceLocationId(wh.locations[0].id);
    }
  };

  const handleDestWhChange = (whId: string) => {
    setDestWarehouseId(whId);
    const wh = warehouses.find(w => w.id === whId);
    if (wh && wh.locations.length > 0) {
      setDestLocationId(wh.locations[0].id);
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
          quantity: 10,
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
      };
      return next;
    });
  };

  const handleQtyChange = (index: number, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setLines(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        quantity: num,
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
    if (sourceLocationId === destLocationId) {
      setErrorMsg('Source location and destination location must be different');
      return;
    }
    if (lines.length === 0) {
      setErrorMsg('Please specify at least one product to transfer');
      return;
    }

    // Verify stock availability at source
    for (const line of lines) {
      const available = getProductStockAtLocation(line.productId, sourceLocationId);
      if (available < line.quantity) {
        setErrorMsg(
          `Insufficient stock for ${line.productName} in ${getLocationName(sourceLocationId)}. Available: ${available} ${line.uom}, Requested to transfer: ${line.quantity} ${line.uom}`
        );
        return;
      }
    }

    const created = createTransfer({
      sourceWarehouseId,
      sourceLocationId,
      destWarehouseId,
      destLocationId,
      status: shouldValidateImmediately ? 'ready' : 'ready',
      lines,
      reason: reason.trim(),
      performedBy: currentUser?.name || 'Warehouse Staff',
    });

    if (shouldValidateImmediately) {
      validateTransfer(created.id);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold">New Internal Stock Transfer</h2>
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

          {/* Locations Routing (From -> To) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {/* Origin */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 block text-xs">Origin (Source Location)</span>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Warehouse</label>
                <select
                  value={sourceWarehouseId}
                  onChange={e => handleSourceWhChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
                >
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Specific Rack / Store</label>
                <select
                  value={sourceLocationId}
                  onChange={e => setSourceLocationId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
                >
                  {srcWh?.locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {loc.zone ? `(${loc.zone})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 block text-xs">Destination (Target Location)</span>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Warehouse</label>
                <select
                  value={destWarehouseId}
                  onChange={e => handleDestWhChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
                >
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Specific Rack / Store</label>
                <select
                  value={destLocationId}
                  onChange={e => setDestLocationId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
                >
                  {destWh?.locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {loc.zone ? `(${loc.zone})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Line Items List */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Products to Move</span>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item Line
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {lines.map((line, idx) => {
                const availableAtSource = getProductStockAtLocation(line.productId, sourceLocationId);
                const hasSufficient = availableAtSource >= line.quantity;

                return (
                  <div key={idx} className="p-3 grid grid-cols-12 gap-2.5 items-center hover:bg-slate-50/50">
                    <div className="col-span-7">
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[10px] text-slate-500">Product</label>
                        <span className={`text-[10px] font-mono ${hasSufficient ? 'text-emerald-700 font-medium' : 'text-rose-600 font-bold'}`}>
                          In Source: {availableAtSource} {line.uom}
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

                    <div className="col-span-4">
                      <label className="block text-[10px] text-slate-500 mb-0.5">Quantity to Move</label>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={e => handleQtyChange(idx, e.target.value)}
                        className={`w-full px-2 py-1.5 text-xs font-mono border rounded focus:outline-none font-bold ${
                          hasSufficient ? 'border-slate-300 text-slate-900' : 'border-rose-400 text-rose-700 bg-rose-50'
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
            <label className="block font-semibold text-slate-700 mb-1">Transfer Reason / Operational Note</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Move to production rack, Rack A to Rack B rebalancing"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center gap-2">
            <input
              type="checkbox"
              id="validateTransferImmediately"
              checked={shouldValidateImmediately}
              onChange={e => setShouldValidateImmediately(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="validateTransferImmediately" className="text-xs text-amber-950 font-medium cursor-pointer">
              <strong>Execute & Move Immediately</strong> (Source location decreases, Destination location increases; total stock remains constant)
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
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs"
            >
              {shouldValidateImmediately ? 'Execute Transfer Now' : 'Schedule Transfer (Ready)'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
