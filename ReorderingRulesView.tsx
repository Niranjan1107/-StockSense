import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  BellRing,
  AlertTriangle,
  ArrowDownLeft,
  CheckCircle2,
  Sliders,
  Package,
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';
import { Product } from '../../types/inventory';

interface ReorderingRulesViewProps {
  onTriggerReceiptForProduct: (product: Product) => void;
  onEditProductRules: (product: Product) => void;
}

export const ReorderingRulesView: React.FC<ReorderingRulesViewProps> = ({
  onTriggerReceiptForProduct,
  onEditProductRules,
}) => {
  const { products, categories, getProductTotalStock, activeWarehouseId } = useInventory();
  const [filterMode, setFilterMode] = useState<'all' | 'critical' | 'warning' | 'healthy'>('all');
  const [search, setSearch] = useState('');

  const enrichedProducts = products.map(product => {
    const currentStock = getProductTotalStock(product, activeWarehouseId);
    const min = product.minStock;
    const max = product.maxStock;
    const deficit = Math.max(0, min - currentStock);
    const suggestedPurchase = Math.max(product.reorderQty, deficit);

    let status: 'critical' | 'warning' | 'healthy' = 'healthy';
    if (currentStock === 0) {
      status = 'critical';
    } else if (currentStock <= min) {
      status = 'critical';
    } else if (currentStock <= min * 1.5) {
      status = 'warning';
    }

    return {
      product,
      currentStock,
      deficit,
      suggestedPurchase,
      status,
      category: categories.find(c => c.id === product.categoryId)?.name || 'General',
    };
  });

  const filtered = enrichedProducts.filter(item => {
    if (filterMode === 'critical' && item.status !== 'critical') return false;
    if (filterMode === 'warning' && item.status !== 'warning') return false;
    if (filterMode === 'healthy' && item.status !== 'healthy') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.product.name.toLowerCase().includes(q);
      const matchSku = item.product.sku.toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reordering Rules & Stock Alerts</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated minimum safety thresholds and instant vendor PO / receipt generation for replenishments.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterMode === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Items ({enrichedProducts.length})
          </button>
          <button
            onClick={() => setFilterMode('critical')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterMode === 'critical' ? 'bg-rose-600 text-white shadow-2xs' : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            Critical / Below Min ({enrichedProducts.filter(p => p.status === 'critical').length})
          </button>
          <button
            onClick={() => setFilterMode('warning')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterMode === 'warning' ? 'bg-amber-600 text-white shadow-2xs' : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Approaching ({enrichedProducts.filter(p => p.status === 'warning').length})
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items by SKU or name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          Showing <span className="font-semibold text-slate-800">{filtered.length}</span> reordering policies
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Item Code & Name</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Current Stock</th>
                <th className="py-2.5 px-4">Min Safety Point</th>
                <th className="py-2.5 px-4">Max Capacity</th>
                <th className="py-2.5 px-4">Suggested Reorder</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Procure Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => {
                const isCrit = item.status === 'critical';
                const isWarn = item.status === 'warning';

                return (
                  <tr key={item.product.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Item */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 inline-block px-1.5 py-0.5 rounded border border-slate-200 mb-0.5">
                        {item.product.sku}
                      </div>
                      <div className="font-semibold text-slate-900">{item.product.name}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {item.category}
                    </td>

                    {/* Current Stock */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`font-mono font-bold text-sm ${isCrit ? 'text-rose-600' : isWarn ? 'text-amber-600' : 'text-slate-900'}`}>
                        {item.currentStock} {item.product.uom}
                      </span>
                    </td>

                    {/* Min Safety Point */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-700">
                      {item.product.minStock} {item.product.uom}
                    </td>

                    {/* Max Capacity */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-500">
                      {item.product.maxStock} {item.product.uom}
                    </td>

                    {/* Suggested Reorder */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-semibold text-slate-900">
                        {item.suggestedPurchase} {item.product.uom}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Est. cost: ${(item.suggestedPurchase * item.product.costPrice).toFixed(2)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isCrit ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Reorder Now
                        </span>
                      ) : isWarn ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Low Buffer
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Adequate
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEditProductRules(item.product)}
                          className="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 rounded-md font-medium text-xs transition-colors"
                        >
                          Edit Rule
                        </button>
                        <button
                          type="button"
                          onClick={() => onTriggerReceiptForProduct(item.product)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-xs inline-flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <ArrowDownLeft className="w-3 h-3" />
                          <span>Create PO / Receipt</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
