import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import {
  Boxes,
  Building2,
  Search,
  Filter,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  PackageCheck
} from 'lucide-react';

export const StockOverviewView: React.FC = () => {
  const {
    products,
    warehouses,
    categories,
    activeWarehouseId,
    getProductTotalStock,
    getLocationName,
  } = useInventory();
  const { isManager } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(activeWarehouseId);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtered products list
  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    return true;
  });

  // Calculate high-level aggregated metrics
  const totalStockUnits = filteredProducts.reduce((sum, p) => sum + getProductTotalStock(p, selectedWarehouse), 0);
  const totalValuation = filteredProducts.reduce((sum, p) => sum + getProductTotalStock(p, selectedWarehouse) * p.costPrice, 0);
  const lowStockCount = filteredProducts.filter(p => {
    const s = getProductTotalStock(p, selectedWarehouse);
    return s > 0 && s <= p.minStock;
  }).length;
  const outOfStockCount = filteredProducts.filter(p => getProductTotalStock(p, selectedWarehouse) === 0).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Stock Overview & Balance Matrix</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated real-time stock levels, allocation across facility storage bins, and inventory valuation.
          </p>
        </div>

        {/* Facility filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs text-xs">
          <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-slate-500 font-medium">Facility:</span>
          <select
            value={selectedWarehouse}
            onChange={e => setSelectedWarehouse(e.target.value)}
            className="font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="all">All Facilities (Consolidated)</option>
            {warehouses.map(wh => (
              <option key={wh.id} value={wh.id}>
                {wh.name} ({wh.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Aggregate metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Total Inventory On Hand
          </span>
          <div className="text-2xl font-black font-mono text-slate-950">
            {totalStockUnits.toLocaleString()} <span className="text-xs font-normal text-slate-500">units</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all storage zones & bins</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Total Asset Valuation
          </span>
          <div className="text-2xl font-black font-mono text-emerald-700">
            ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Based on current unit cost price</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 block mb-1">
            Low Stock Warnings
          </span>
          <div className="text-2xl font-black font-mono text-amber-600">
            {lowStockCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Items at or below safety reorder level</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 block mb-1">
            Stockouts (Zero Units)
          </span>
          <div className="text-2xl font-black font-mono text-rose-600">
            {outOfStockCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Critical replenishment required</p>
        </div>
      </div>

      {/* Filter controls */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search SKU or item name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Detailed Stock Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Item SKU & Name</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Location Breakdown</th>
                <th className="py-2.5 px-4 text-right">Available Stock</th>
                <th className="py-2.5 px-4 text-right">Safety Buffer</th>
                <th className="py-2.5 px-4 text-right">Inventory Value</th>
                <th className="py-2.5 px-4">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => {
                const totalStock = getProductTotalStock(p, selectedWarehouse);
                const isZero = totalStock === 0;
                const isLow = totalStock > 0 && totalStock <= p.minStock;
                const category = categories.find(c => c.id === p.categoryId);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 inline-block px-1.5 py-0.5 rounded border border-slate-200 mb-0.5">
                        {p.sku}
                      </div>
                      <div className="font-semibold text-slate-900">{p.name}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {category?.name || 'General'}
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(p.stockByLocation || {}).map(([locId, qty]) => {
                          if (qty <= 0) return null;
                          return (
                            <span
                              key={locId}
                              className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200/70 font-mono"
                            >
                              {getLocationName(locId).split('(')[0].trim()}: <strong>{qty}</strong>
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold text-sm text-slate-950">
                      {totalStock} {p.uom}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-slate-600">
                      Min: {p.minStock} {p.uom}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-semibold text-slate-900">
                      ${(totalStock * p.costPrice).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {isZero ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Optimal
                        </span>
                      )}
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
