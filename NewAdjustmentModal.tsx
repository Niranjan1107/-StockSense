import React, { useState, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { AdjustmentReason } from '../../types/inventory';
import { X, SlidersHorizontal, AlertCircle, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';

interface NewAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProductId?: string;
}

export const NewAdjustmentModal: React.FC<NewAdjustmentModalProps> = ({
  isOpen,
  onClose,
  preselectedProductId,
}) => {
  const {
    products,
    warehouses,
    executeAdjustment,
    getProductStockAtLocation,
    getLocationName,
  } = useInventory();

  const [productId, setProductId] = useState(preselectedProductId || products[0]?.id || 'prod-steel');
  const [warehouseId, setWarehouseId] = useState('wh-2');
  const [locationId, setLocationId] = useState('loc-pr');
  const [countedQty, setCountedQty] = useState('');
  const [reason, setReason] = useState<AdjustmentReason>('damaged');
  const [notes, setNotes] = useState('Physical audit variance; scrap write-off');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedProduct = products.find(p => p.id === productId);
  const currentWh = warehouses.find(w => w.id === warehouseId) || warehouses[0];
  const recordedQty = selectedProduct ? getProductStockAtLocation(selectedProduct.id, locationId) : 0;

  useEffect(() => {
    if (preselectedProductId) {
      setProductId(preselectedProductId);
    }
  }, [preselectedProductId]);

  if (!isOpen) return null;

  const countedNum = countedQty === '' ? recordedQty : Math.max(0, parseInt(countedQty, 10) || 0);
  const diff = countedNum - recordedQty;

  const handleWarehouseChange = (whId: string) => {
    setWarehouseId(whId);
    const wh = warehouses.find(w => w.id === whId);
    if (wh && wh.locations.length > 0) {
      setLocationId(wh.locations[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      setErrorMsg('Please select a product');
      return;
    }
    if (countedQty === '') {
      setErrorMsg('Please input the verified physical counted quantity');
      return;
    }

    const res = executeAdjustment({
      warehouseId,
      locationId,
      productId: selectedProduct.id,
      countedQty: countedNum,
      reason,
      notes: notes.trim(),
    });

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-semibold">Inventory Adjustment (Physical Count vs System)</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Product selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Product to Reconcile *</label>
            <select
              value={productId}
              onChange={e => {
                setProductId(e.target.value);
                setCountedQty('');
              }}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name} ({p.uom})
                </option>
              ))}
            </select>
          </div>

          {/* Warehouse and Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Warehouse</label>
              <select
                value={warehouseId}
                onChange={e => handleWarehouseChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              >
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({wh.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Specific Rack / Store</label>
              <select
                value={locationId}
                onChange={e => {
                  setLocationId(e.target.value);
                  setCountedQty('');
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              >
                {currentWh?.locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.zone ? `(${loc.zone})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Card: System vs Counted */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">Recorded System Stock</span>
                <span className="text-xl font-bold font-mono text-slate-800">
                  {recordedQty} <span className="text-xs font-normal text-slate-500">{selectedProduct?.uom}</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{getLocationName(locationId)}</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-purple-200 ring-2 ring-purple-500/20">
                <label className="text-[10px] text-purple-700 font-bold uppercase block mb-1">Physical Count *</label>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={countedQty}
                    onChange={e => setCountedQty(e.target.value)}
                    placeholder={recordedQty.toString()}
                    className="w-20 text-center font-mono font-bold text-xl text-purple-900 border-b-2 border-purple-600 focus:outline-none bg-purple-50/40 rounded py-0.5"
                    required
                  />
                  <span className="text-xs font-semibold text-purple-700">{selectedProduct?.uom}</span>
                </div>
              </div>

              <div className={`p-3 rounded-lg border flex flex-col justify-center ${
                diff === 0 
                  ? 'bg-slate-100/60 border-slate-200 text-slate-600'
                  : diff < 0 
                  ? 'bg-rose-50 border-rose-200 text-rose-800' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <span className="text-[10px] font-semibold uppercase block">Net Delta</span>
                <div className="text-xl font-black font-mono flex items-center justify-center gap-1">
                  {diff < 0 ? <TrendingDown className="w-4 h-4 text-rose-600" /> : diff > 0 ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : null}
                  <span>{diff >= 0 ? `+${diff}` : diff}</span>
                </div>
                <span className="text-[10px] font-medium">{diff < 0 ? 'Shortage / Loss' : diff > 0 ? 'Surplus / Found' : 'Balanced'}</span>
              </div>

            </div>
          </div>

          {/* Reason and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Adjustment Reason *</label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value as AdjustmentReason)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              >
                <option value="damaged">Damaged Goods (Scrap write-off)</option>
                <option value="spoilage">Spoilage / Expiry</option>
                <option value="theft_loss">Theft / Unaccounted Shrinkage</option>
                <option value="found_cycle_count">Found Stock during Cycle Count</option>
                <option value="annual_audit">Periodic / Annual Physical Audit</option>
                <option value="data_correction">Manual Entry Data Correction</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Audit Explanation</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. 3 kg steel bent/damaged on production rack"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
            Upon validation, the stock at <strong className="text-slate-800">{getLocationName(locationId)}</strong> will be calibrated to exactly <strong className="text-slate-900">{countedNum} {selectedProduct?.uom}</strong>. The variance will be permanently logged in the Stock Ledger.
          </p>

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
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-xs"
            >
              Validate & Adjust Stock
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
