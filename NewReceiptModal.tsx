import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Product, ReceiptLine } from '../../types/inventory';
import { X, ArrowDownLeft, Plus, Trash2, Building2, AlertCircle } from 'lucide-react';

interface NewReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProduct?: Product | null;
}

export const NewReceiptModal: React.FC<NewReceiptModalProps> = ({
  isOpen,
  onClose,
  preselectedProduct,
}) => {
  const { products, warehouses, createReceipt, validateReceipt } = useInventory();

  const [supplierName, setSupplierName] = useState(
    preselectedProduct?.name.toLowerCase().includes('steel')
      ? 'Apex Industrial Metals Co.'
      : 'Midwest Supply Partners'
  );
  const [targetWarehouseId, setTargetWarehouseId] = useState('wh-1');
  const [targetLocationId, setTargetLocationId] = useState('loc-ms');
  const [notes, setNotes] = useState('');
  const [shouldValidateImmediately, setShouldValidateImmediately] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Line items
  const [lines, setLines] = useState<ReceiptLine[]>(() => {
    if (preselectedProduct) {
      return [
        {
          productId: preselectedProduct.id,
          productName: preselectedProduct.name,
          sku: preselectedProduct.sku,
          uom: preselectedProduct.uom,
          orderedQty: preselectedProduct.reorderQty || 50,
          receivedQty: preselectedProduct.reorderQty || 50,
          unitCost: preselectedProduct.costPrice || 0,
        },
      ];
    }
    const firstProd = products[0];
    return firstProd
      ? [
          {
            productId: firstProd.id,
            productName: firstProd.name,
            sku: firstProd.sku,
            uom: firstProd.uom,
            orderedQty: 50,
            receivedQty: 50,
            unitCost: firstProd.costPrice,
          },
        ]
      : [];
  });

  if (!isOpen) return null;

  const currentWh = warehouses.find(w => w.id === targetWarehouseId) || warehouses[0];

  const handleWarehouseChange = (whId: string) => {
    setTargetWarehouseId(whId);
    const wh = warehouses.find(w => w.id === whId);
    if (wh && wh.locations.length > 0) {
      setTargetLocationId(wh.locations[0].id);
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
          orderedQty: 10,
          receivedQty: 10,
          unitCost: unselected.costPrice,
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
        unitCost: prod.costPrice,
      };
      return next;
    });
  };

  const handleQtyChange = (index: number, field: 'orderedQty' | 'receivedQty' | 'unitCost', val: string) => {
    const num = Math.max(0, parseFloat(val) || 0);
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
    if (!supplierName.trim()) {
      setErrorMsg('Please specify the vendor / supplier name');
      return;
    }
    if (lines.length === 0) {
      setErrorMsg('Please add at least one product line item');
      return;
    }

    const created = createReceipt({
      supplierName: supplierName.trim(),
      targetWarehouseId,
      targetLocationId,
      status: shouldValidateImmediately ? 'ready' : 'ready',
      lines,
      notes: notes.trim(),
    });

    if (shouldValidateImmediately) {
      validateReceipt(created.id);
    }

    onClose();
  };

  const totalReceiptValue = lines.reduce((acc, l) => acc + l.receivedQty * l.unitCost, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold">New Goods Receipt (Incoming Stock)</h2>
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

          {/* Supplier & Target Storage Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Supplier / Vendor *</label>
              <input
                type="text"
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                placeholder="e.g. Apex Industrial Metals Co."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Receiving Warehouse</label>
              <select
                value={targetWarehouseId}
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
              <label className="block font-semibold text-slate-700 mb-1">Target Staging / Bay</label>
              <select
                value={targetLocationId}
                onChange={e => setTargetLocationId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {currentWh?.locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.zone ? `(${loc.zone})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Line Items List */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Arrived Products & Quantities</span>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Product Line
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {lines.map((line, idx) => (
                <div key={idx} className="p-3 grid grid-cols-12 gap-2.5 items-center hover:bg-slate-50/50">
                  <div className="col-span-5">
                    <label className="block text-[10px] text-slate-500 mb-0.5">Product</label>
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

                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-500 mb-0.5">Ordered Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={line.orderedQty}
                      onChange={e => handleQtyChange(idx, 'orderedQty', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-mono border border-slate-300 rounded focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-500 mb-0.5">Received Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={line.receivedQty}
                      onChange={e => handleQtyChange(idx, 'receivedQty', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-mono border border-slate-300 rounded focus:outline-none font-bold text-emerald-700"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-500 mb-0.5">Unit Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={line.unitCost}
                      onChange={e => handleQtyChange(idx, 'unitCost', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none"
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
              ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {lines.length} line item(s) to be credited to target inventory
              </span>
              <span className="font-bold text-slate-900">
                Estimated Value: ${totalReceiptValue.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Receipt Notes / Inspection Remarks</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Delivered via Freight Truck Dock 1; all packaging seals intact"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center gap-2">
            <input
              type="checkbox"
              id="validateReceiptImmediately"
              checked={shouldValidateImmediately}
              onChange={e => setShouldValidateImmediately(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="validateReceiptImmediately" className="text-xs text-emerald-950 font-medium cursor-pointer">
              <strong>Validate & Update Stock Immediately</strong> (+{lines.reduce((s, l) => s + l.receivedQty, 0)} units will be credited to stock immediately)
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
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            >
              {shouldValidateImmediately ? 'Create & Validate Receipt' : 'Create Receipt (Ready)'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
