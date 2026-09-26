import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types/inventory';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Edit2,
  Trash2,
  Eye,
  Building2,
  ChevronDown,
  ChevronRight,
  ArrowDownLeft,
  SlidersHorizontal,
  Layers,
  X,
  CheckCircle2,
  DollarSign,
  Tag
} from 'lucide-react';

interface ProductsViewProps {
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onQuickAdjust: (productId: string) => void;
  onQuickReceive: (productId: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onOpenNewProduct,
  onEditProduct,
  onQuickAdjust,
  onQuickReceive,
}) => {
  const {
    products,
    categories,
    warehouses,
    deleteProduct,
    getProductTotalStock,
    activeWarehouseId,
    getLocationName,
  } = useInventory();
  const { isManager } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>(activeWarehouseId);
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  
  // Product Detail Modal state
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Delete confirmation modal state
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => {
    // Search by name, SKU, or description
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchDesc) return false;
    }

    // Category Filter
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
      return false;
    }

    // Stock Status
    const totalStock = getProductTotalStock(p, selectedWarehouseFilter);
    if (stockStatusFilter === 'out_of_stock' && totalStock > 0) return false;
    if (stockStatusFilter === 'low_stock' && (totalStock === 0 || totalStock > p.minStock)) return false;
    if (stockStatusFilter === 'in_stock' && totalStock <= p.minStock) return false;

    return true;
  });

  const confirmDelete = () => {
    if (deletingProduct) {
      deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Product Catalog & Stock Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain master SKU registry, locations, reorder safety parameters, and live physical stock.
          </p>
        </div>

        {isManager && (
          <button
            onClick={onOpenNewProduct}
            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by product name, SKU code, or specifications..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Warehouse Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={selectedWarehouseFilter}
              onChange={e => setSelectedWarehouseFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
            >
              <option value="all">All Facilities</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Level Filter */}
          <select
            value={stockStatusFilter}
            onChange={e => setStockStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock (Healthy)</option>
            <option value="low_stock">Low Stock (Alert)</option>
            <option value="out_of_stock">Out of Stock (Zero)</option>
          </select>
        </div>
      </div>

      {/* Products Table with exact required columns: Product, SKU, Category, Available Stock, Location, Reorder Level, Status, Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span>No products found matching the criteria.</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Available Stock</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Reorder Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(product => {
                  const totalStock = getProductTotalStock(product, selectedWarehouseFilter);
                  const isLow = totalStock > 0 && totalStock <= product.minStock;
                  const isOut = totalStock === 0;
                  const category = categories.find(c => c.id === product.categoryId);

                  // Extract locations where product is stocked
                  const activeLocations = Object.entries(product.stockByLocation || {})
                    .filter(([_, qty]) => qty > 0)
                    .map(([locId, qty]) => `${getLocationName(locId).split('(')[0].trim()} (${qty})`);

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product Name & Description */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 text-xs">{product.name}</div>
                        {product.description && (
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">{product.description}</div>
                        )}
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        <span className="font-bold text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {product.sku}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                        {category ? category.name : 'General'}
                      </td>

                      {/* Available Stock */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-mono font-bold text-sm text-slate-950">
                          {totalStock} {product.uom}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-[200px]">
                        {activeLocations.length > 0 ? (
                          <div className="text-[11px] truncate" title={activeLocations.join(', ')}>
                            {activeLocations.slice(0, 2).join(', ')}
                            {activeLocations.length > 2 && ` +${activeLocations.length - 2} more`}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unallocated</span>
                        )}
                      </td>

                      {/* Reorder Level */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-slate-600">
                        {product.minStock} {product.uom}
                      </td>

                      {/* Status Badges with consistent styling */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            <span>Out of Stock</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            <span>Low Stock</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>In Stock</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Product (Available to both Manager & Staff) */}
                          <button
                            type="button"
                            onClick={() => setViewingProduct(product)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Product Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Quick Receive */}
                          <button
                            type="button"
                            onClick={() => onQuickReceive(product.id)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Create Vendor Receipt (+Stock)"
                          >
                            <ArrowDownLeft className="w-4 h-4" />
                          </button>

                          {/* Quick Adjust */}
                          <button
                            type="button"
                            onClick={() => onQuickAdjust(product.id)}
                            className="p-1.5 text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="Count / Stock Adjustment"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>

                          {/* Edit Product (Manager Only) */}
                          {isManager && (
                            <button
                              type="button"
                              onClick={() => onEditProduct(product)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Product (Manager Only) */}
                          {isManager && (
                            <button
                              type="button"
                              onClick={() => setDeletingProduct(product)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* VIEW PRODUCT DETAIL MODAL */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {viewingProduct.sku}
                </span>
                <h3 className="text-base font-bold text-slate-950 mt-1">{viewingProduct.name}</h3>
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Category</span>
                <span className="font-bold text-slate-800">
                  {categories.find(c => c.id === viewingProduct.categoryId)?.name || 'General'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Unit of Measure</span>
                <span className="font-bold text-slate-800">{viewingProduct.uom}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cost Price</span>
                <span className="font-bold text-slate-800">${viewingProduct.costPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Selling Price</span>
                <span className="font-bold text-slate-800">${viewingProduct.sellingPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Safety Reorder Point</span>
                <span className="font-bold text-amber-700 font-mono">{viewingProduct.minStock} {viewingProduct.uom}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Max Storage Limit</span>
                <span className="font-bold text-slate-800 font-mono">{viewingProduct.maxStock} {viewingProduct.uom}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-600" />
                <span>Physical Stock Distribution Across Racks:</span>
              </h4>
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {Object.entries(viewingProduct.stockByLocation || {}).map(([locId, qty]) => (
                  <div key={locId} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700">{getLocationName(locId)}</span>
                    <span className="font-mono font-bold text-slate-900">{qty} {viewingProduct.uom}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 text-xs">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-950">Confirm Deletion</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong className="text-slate-800">{deletingProduct.name}</strong> ({deletingProduct.sku})? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="flex-1 py-2 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold cursor-pointer shadow-xs"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
