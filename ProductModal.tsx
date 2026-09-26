import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Product } from '../../types/inventory';
import { X, Package, Sparkles, Building2, Plus, AlertCircle } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { categories, warehouses, addProduct, updateProduct } = useInventory();

  const [name, setName] = useState(productToEdit?.name || '');
  const [sku, setSku] = useState(productToEdit?.sku || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [categoryId, setCategoryId] = useState(productToEdit?.categoryId || categories[0]?.id || 'cat-raw');
  const [uom, setUom] = useState(productToEdit?.uom || 'units');
  const [costPrice, setCostPrice] = useState(productToEdit?.costPrice?.toString() || '0');
  const [sellingPrice, setSellingPrice] = useState(productToEdit?.sellingPrice?.toString() || '0');
  const [minStock, setMinStock] = useState(productToEdit?.minStock?.toString() || '10');
  const [maxStock, setMaxStock] = useState(productToEdit?.maxStock?.toString() || '100');
  const [reorderQty, setReorderQty] = useState(productToEdit?.reorderQty?.toString() || '25');

  // Stock by location editor
  const [stockByLocation, setStockByLocation] = useState<Record<string, number>>(
    productToEdit?.stockByLocation || {}
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateSku = () => {
    const selectedCat = categories.find(c => c.id === categoryId);
    const catCode = selectedCat ? selectedCat.code : 'GEN';
    const rand = Math.floor(100 + Math.random() * 900);
    const cleanName = name ? name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X') : 'ITM';
    setSku(`${catCode}-${cleanName}-${rand}`);
  };

  const handleLocationQtyChange = (locId: string, value: string) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setStockByLocation(prev => ({
      ...prev,
      [locId]: num,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Product name is required');
      return;
    }
    if (!sku.trim()) {
      setErrorMsg('SKU is required');
      return;
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        description: description.trim(),
        categoryId,
        uom: uom.trim(),
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        minStock: parseInt(minStock, 10) || 0,
        maxStock: parseInt(maxStock, 10) || 0,
        reorderQty: parseInt(reorderQty, 10) || 0,
        stockByLocation,
      });
    } else {
      addProduct({
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        description: description.trim(),
        categoryId,
        uom: uom.trim(),
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        minStock: parseInt(minStock, 10) || 0,
        maxStock: parseInt(maxStock, 10) || 0,
        reorderQty: parseInt(reorderQty, 10) || 0,
        stockByLocation,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold">
              {productToEdit ? `Edit Product: ${productToEdit.sku}` : 'Add New Inventory Product'}
            </h2>
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

          {/* Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Steel Rods (High Tensile)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">SKU / Item Code *</label>
                <button
                  type="button"
                  onClick={handleGenerateSku}
                  className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-Gen SKU
                </button>
              </div>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="e.g. RAW-STL-001"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 uppercase"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit of Measure (UoM)</label>
              <select
                value={uom}
                onChange={e => setUom(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="units">units (Items / Pcs)</option>
                <option value="kg">kg (Kilograms)</option>
                <option value="meters">meters (Linear)</option>
                <option value="boxes">boxes (Cartons)</option>
                <option value="liters">liters (Volume)</option>
                <option value="rolls">rolls</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cost Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={e => setCostPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description / Spec Notes</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. 12mm cold-drawn structural steel bars"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Reordering Rules Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Reordering Rules & Stock Thresholds
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Min Safety Stock (Alert)</label>
                <input
                  type="number"
                  value={minStock}
                  onChange={e => setMinStock(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <span className="text-[10px] text-slate-500">Triggers low-stock warning</span>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Max Storage Capacity</label>
                <input
                  type="number"
                  value={maxStock}
                  onChange={e => setMaxStock(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <span className="text-[10px] text-slate-500">Warehouse limit</span>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Suggested Reorder Qty</label>
                <input
                  type="number"
                  value={reorderQty}
                  onChange={e => setReorderQty(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <span className="text-[10px] text-slate-500">PO auto-fill value</span>
              </div>
            </div>
          </div>

          {/* Stock Availability per Location */}
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Building2 className="w-4 h-4 text-slate-600" />
                Initial Stock Allocation by Warehouse & Location
              </h4>
              <span className="text-slate-500 font-mono text-[11px]">
                Total: {Object.values(stockByLocation).reduce((a, b) => a + b, 0)} {uom}
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {warehouses.map(wh => (
                <div key={wh.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="font-semibold text-slate-800 text-[11px] mb-1.5">
                    {wh.name} ({wh.code})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {wh.locations.map(loc => (
                      <div key={loc.id} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200">
                        <span className="text-[11px] text-slate-700 truncate mr-2">
                          {loc.name} {loc.zone ? `· ${loc.zone}` : ''}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="number"
                            min="0"
                            value={stockByLocation[loc.id] ?? 0}
                            onChange={e => handleLocationQtyChange(loc.id, e.target.value)}
                            className="w-16 px-1.5 py-0.5 text-right font-mono text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                          />
                          <span className="text-[10px] text-slate-400 w-8">{uom}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              {productToEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
