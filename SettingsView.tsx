import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Plus,
  Layers,
  MapPin,
  Tag,
  Check,
  AlertCircle,
  Hash,
  Boxes,
  Shield,
  Layers2,
  CheckCircle2,
  Package
} from 'lucide-react';
import { Warehouse } from '../../types/inventory';

interface SettingsViewProps {
  initialTab?: 'warehouses' | 'categories';
}

export const SettingsView: React.FC<SettingsViewProps> = ({ initialTab = 'warehouses' }) => {
  const { warehouses, categories, products, addWarehouse, addLocation, addCategory } = useInventory();
  const { isManager } = useAuth();
  const [activeTab, setActiveTab] = useState<'warehouses' | 'categories'>(initialTab);

  // New warehouse modal state
  const [showAddWhModal, setShowAddWhModal] = useState(false);
  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whAddress, setWhAddress] = useState('');
  const [whType, setWhType] = useState<Warehouse['type']>('storage');

  // New location modal state
  const [selectedWhForLoc, setSelectedWhForLoc] = useState<string | null>(null);
  const [locName, setLocName] = useState('');
  const [locCode, setLocCode] = useState('');
  const [locZone, setLocZone] = useState('');

  // New category modal state
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName.trim() || !whCode.trim()) return;

    addWarehouse({
      name: whName.trim(),
      code: whCode.trim().toUpperCase(),
      address: whAddress.trim() || 'Logistics District',
      type: whType,
      locations: [
        {
          id: `loc-${Date.now()}-1`,
          warehouseId: '',
          code: `${whCode.trim().toUpperCase()}-BAY1`,
          name: 'General Storage Bay 1',
          zone: 'Zone 1',
        },
      ],
    });

    setWhName('');
    setWhCode('');
    setWhAddress('');
    setShowAddWhModal(false);
    setFeedback('Facility created successfully!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWhForLoc || !locName.trim() || !locCode.trim()) return;

    addLocation(selectedWhForLoc, {
      name: locName.trim(),
      code: locCode.trim().toUpperCase(),
      zone: locZone.trim() || 'General',
    });

    setLocName('');
    setLocCode('');
    setLocZone('');
    setSelectedWhForLoc(null);
    setFeedback('New rack added successfully!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catCode.trim()) return;

    addCategory({
      name: catName.trim(),
      code: catCode.trim().toUpperCase(),
      description: catDesc.trim(),
    });

    setCatName('');
    setCatCode('');
    setCatDesc('');
    setShowAddCatModal(false);
    setFeedback('Product category created!');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-900" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Warehouses, Racks & Storage Architecture</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure multi-facility structures, physical storage racks, capacity limits, and product taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('warehouses')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'warehouses' ? 'bg-white text-slate-950 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Warehouses & Racks ({warehouses.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'categories' ? 'bg-white text-slate-950 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Product Categories ({categories.length})
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tab 1: Warehouses & Racks */}
      {activeTab === 'warehouses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Configured Facilities & Storage Locations
            </h3>
            {isManager && (
              <button
                onClick={() => setShowAddWhModal(true)}
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Facility</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {warehouses.map(wh => {
              // Calculate total products and total stock in this warehouse
              const locIds = new Set(wh.locations.map(l => l.id));
              let totalStockInWh = 0;
              let productsStoredCount = 0;

              products.forEach(p => {
                let pStockInWh = 0;
                Object.entries(p.stockByLocation || {}).forEach(([locId, qty]) => {
                  if (locIds.has(locId)) {
                    pStockInWh += qty;
                  }
                });
                if (pStockInWh > 0) {
                  productsStoredCount++;
                  totalStockInWh += pStockInWh;
                }
              });

              return (
                <div
                  key={wh.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between"
                >
                  {/* Warehouse Card Header */}
                  <div className="p-5 border-b border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {wh.code}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Operational
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        {wh.type} Facility
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-slate-950 text-base">{wh.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{wh.address}</span>
                      </p>
                    </div>

                    {/* Warehouse Summary Numbers */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Products</span>
                        <span className="font-bold text-slate-900 font-mono text-sm">{productsStoredCount} SKUs</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Stock Quantity</span>
                        <span className="font-bold text-emerald-700 font-mono text-sm">{totalStockInWh} units</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Racks & Bays</span>
                        <span className="font-bold text-slate-900 font-mono text-sm">{wh.locations.length} Racks</span>
                      </div>
                    </div>
                  </div>

                  {/* Inside Warehouse: Racks & Storage Locations with Utilization Bars */}
                  <div className="p-5 space-y-3 bg-slate-50/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Racks & Storage Locations</span>
                      {isManager && (
                        <button
                          type="button"
                          onClick={() => setSelectedWhForLoc(wh.id)}
                          className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Rack</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      {wh.locations.map(loc => {
                        // Calculate stock currently resting in this location
                        let locTotalStock = 0;
                        const itemsInLoc: string[] = [];

                        products.forEach(p => {
                          const q = p.stockByLocation[loc.id] || 0;
                          if (q > 0) {
                            locTotalStock += q;
                            itemsInLoc.push(`${p.name} (${q})`);
                          }
                        });

                        // Standard rack capacity (e.g. 100 or 150 units)
                        const rackCapacity = 120;
                        const utilPercent = Math.min(100, Math.round((locTotalStock / rackCapacity) * 100));

                        return (
                          <div
                            key={loc.id}
                            className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] border border-slate-200">
                                  {loc.code}
                                </span>
                                <span className="font-bold text-slate-800">{loc.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                                {loc.zone || 'Zone A'}
                              </span>
                            </div>

                            {/* Utilization Bar as requested: e.g. Rack A [████████░░] 80% */}
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500 font-medium">
                                  Current: <strong className="text-slate-800">{locTotalStock}</strong> / {rackCapacity} units
                                </span>
                                <span className="font-mono font-bold text-slate-900">{utilPercent}% capacity</span>
                              </div>
                              
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
                                <div
                                  style={{ width: `${utilPercent}%` }}
                                  className={`h-full rounded-full transition-all ${
                                    utilPercent > 85 ? 'bg-rose-500' : utilPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Stored items summary */}
                            {itemsInLoc.length > 0 && (
                              <p className="text-[10px] text-slate-500 truncate pt-0.5" title={itemsInLoc.join(', ')}>
                                Storing: {itemsInLoc.slice(0, 2).join(', ')}{itemsInLoc.length > 2 && ` +${itemsInLoc.length - 2} more`}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Categories */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Product Classification Categories
            </h3>
            {isManager && (
              <button
                onClick={() => setShowAddCatModal(true)}
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Category Code</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Associated SKUs</th>
                  <th className="py-3 px-4">Description Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map(cat => {
                  const skuCount = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {cat.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {cat.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {skuCount} Products
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {cat.description || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Warehouse Modal */}
      {showAddWhModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs">
          <form onSubmit={handleCreateWarehouse} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-950">Add New Facility</h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Facility Name *</label>
              <input
                type="text"
                value={whName}
                onChange={e => setWhName(e.target.value)}
                placeholder="e.g. East Coast Distribution Hub"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facility Code *</label>
                <input
                  type="text"
                  value={whCode}
                  onChange={e => setWhCode(e.target.value)}
                  placeholder="WH-EAST"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl uppercase font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Type</label>
                <select
                  value={whType}
                  onChange={e => setWhType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none bg-white"
                >
                  <option value="main">Main Warehouse</option>
                  <option value="production">Production Floor</option>
                  <option value="distribution">Distribution Hub</option>
                  <option value="storage">Storage Overflow</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Physical Address</label>
              <input
                type="text"
                value={whAddress}
                onChange={e => setWhAddress(e.target.value)}
                placeholder="Street address, city, state"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddWhModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-950 text-white rounded-xl font-semibold hover:bg-slate-800 cursor-pointer shadow-xs"
              >
                Create Facility
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Location Modal */}
      {selectedWhForLoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs">
          <form onSubmit={handleCreateLocation} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-950">Add Rack / Bay Location</h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rack Name *</label>
              <input
                type="text"
                value={locName}
                onChange={e => setLocName(e.target.value)}
                placeholder="e.g. Rack C or Assembly Bay 3"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location Code *</label>
                <input
                  type="text"
                  value={locCode}
                  onChange={e => setLocCode(e.target.value)}
                  placeholder="LOC-RC"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl uppercase font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Zone / Aisle</label>
                <input
                  type="text"
                  value={locZone}
                  onChange={e => setLocZone(e.target.value)}
                  placeholder="Zone B / Aisle 3"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedWhForLoc(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-950 text-white rounded-xl font-semibold hover:bg-slate-800 cursor-pointer shadow-xs"
              >
                Add Rack Location
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs">
          <form onSubmit={handleCreateCategory} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-950">Add Product Category</h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
              <input
                type="text"
                value={catName}
                onChange={e => setCatName(e.target.value)}
                placeholder="e.g. Industrial Fasteners"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category Code *</label>
              <input
                type="text"
                value={catCode}
                onChange={e => setCatCode(e.target.value)}
                placeholder="FAST"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl uppercase font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scope Description</label>
              <input
                type="text"
                value={catDesc}
                onChange={e => setCatDesc(e.target.value)}
                placeholder="Hardware components and fasteners"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddCatModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-950 text-white rounded-xl font-semibold hover:bg-slate-800 cursor-pointer shadow-xs"
              >
                Create Category
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
