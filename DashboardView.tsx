import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Building2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  ArrowRight,
  Boxes,
  Plus,
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenNewReceipt: () => void;
  onOpenNewDelivery: () => void;
  onOpenNewTransfer: () => void;
  onOpenNewAdjustment: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenNewReceipt,
  onOpenNewDelivery,
  onOpenNewTransfer,
  onOpenNewAdjustment,
}) => {
  const {
    kpis,
    products,
    receipts,
    deliveries,
    transfers,
    adjustments,
    warehouses,
    activeWarehouseId,
    getWarehouseName,
    getLocationName,
    getProductTotalStock,
  } = useInventory();
  const { currentUser, isManager } = useAuth();

  // Low stock products alert list
  const lowStockProducts = products.filter(p => {
    const s = getProductTotalStock(p, activeWarehouseId);
    return s > 0 && s <= p.minStock;
  });

  const outOfStockProducts = products.filter(p => {
    const s = getProductTotalStock(p, activeWarehouseId);
    return s === 0;
  });

  // Recent consolidated activity feed
  const recentActivities = React.useMemo(() => {
    const list: Array<{
      id: string;
      type: 'receipt' | 'delivery' | 'transfer' | 'adjustment';
      refNumber: string;
      title: string;
      subtitle: string;
      date: string;
      status: string;
      tab: NavTab;
    }> = [];

    receipts.forEach(r => {
      list.push({
        id: r.id,
        type: 'receipt',
        refNumber: r.documentNumber,
        title: `Goods Receipt from ${r.supplierName}`,
        subtitle: `${r.lines.reduce((s, l) => s + l.orderedQty, 0)} units · ${getLocationName(r.targetLocationId)}`,
        date: r.dateCreated,
        status: r.status,
        tab: 'receipts',
      });
    });

    deliveries.forEach(d => {
      list.push({
        id: d.id,
        type: 'delivery',
        refNumber: d.documentNumber,
        title: `Delivery Order to ${d.customerName}`,
        subtitle: `${d.lines.reduce((s, l) => s + l.orderedQty, 0)} units · ${getLocationName(d.sourceLocationId)}`,
        date: d.dateCreated,
        status: d.status,
        tab: 'deliveries',
      });
    });

    transfers.forEach(t => {
      list.push({
        id: t.id,
        type: 'transfer',
        refNumber: t.documentNumber,
        title: `Transfer: ${getLocationName(t.sourceLocationId)} → ${getLocationName(t.destLocationId)}`,
        subtitle: `${t.lines.reduce((s, l) => s + l.quantity, 0)} units relocated`,
        date: t.dateCreated,
        status: t.status,
        tab: 'transfers',
      });
    });

    adjustments.forEach(a => {
      list.push({
        id: a.id,
        type: 'adjustment',
        refNumber: a.documentNumber,
        title: `Physical Audit: ${a.productName}`,
        subtitle: `Delta: ${a.differenceQty >= 0 ? '+' : ''}${a.differenceQty} ${a.uom} (${a.reason})`,
        date: a.createdAt,
        status: a.status,
        tab: 'adjustments',
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [receipts, deliveries, transfers, adjustments, warehouses]);

  // Synthetic stock movement chart breakdown (last 6 operational days)
  const movementDays = [
    { day: 'Mon', incoming: 120, outgoing: 85 },
    { day: 'Tue', incoming: 95, outgoing: 110 },
    { day: 'Wed', incoming: 150, outgoing: 70 },
    { day: 'Thu', incoming: 60, outgoing: 90 },
    { day: 'Fri', incoming: 140, outgoing: 125 },
    { day: 'Sat', incoming: 75, outgoing: 40 },
  ];
  const maxVolume = 160;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Executive Inventory Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Facility: <strong className="text-slate-800 font-semibold">{getWarehouseName(activeWarehouseId)}</strong> · Real-time telemetry & stock movement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewReceipt}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Receive Stock</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewDelivery}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Ship Delivery</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6 TOP KPI CARDS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* KPI 1: Total Products */}
        <div
          onClick={() => setActiveTab('products')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Total Products</span>
            <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 font-mono tracking-tight">
            {kpis.totalProductsInStock}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>+4 new SKUs this month</span>
          </div>
        </div>

        {/* KPI 2: Low Stock */}
        <div
          onClick={() => setActiveTab('reordering')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Low Stock</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono tracking-tight">
            {kpis.lowStockCount}
          </div>
          <div className="mt-1 text-[10px] text-amber-700 font-medium">
            Below safety buffer
          </div>
        </div>

        {/* KPI 3: Out of Stock */}
        <div
          onClick={() => setActiveTab('products')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Out of Stock</span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono tracking-tight">
            {kpis.outOfStockCount}
          </div>
          <div className="mt-1 text-[10px] text-rose-700 font-medium">
            Zero physical balance
          </div>
        </div>

        {/* KPI 4: Pending Receipts */}
        <div
          onClick={() => setActiveTab('receipts')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Pending Receipts</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
            {kpis.pendingReceiptsCount}
          </div>
          <div className="mt-1 text-[10px] text-emerald-700 font-medium">
            Supplier shipments
          </div>
        </div>

        {/* KPI 5: Pending Deliveries */}
        <div
          onClick={() => setActiveTab('deliveries')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Pending Deliveries</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-700 font-mono tracking-tight">
            {kpis.pendingDeliveriesCount}
          </div>
          <div className="mt-1 text-[10px] text-blue-700 font-medium">
            Awaiting dispatch
          </div>
        </div>

        {/* KPI 6: Internal Transfers */}
        <div
          onClick={() => setActiveTab('transfers')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Transfers Scheduled</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono tracking-tight">
            {kpis.scheduledTransfersCount}
          </div>
          <div className="mt-1 text-[10px] text-amber-700 font-medium">
            Facility relocation
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 2ND ROW: INVENTORY OVERVIEW CHART + STOCK ALERTS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Inventory Overview (Stock Movement Chart) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Inventory Movement & Dock Throughput</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Incoming vendor receipts vs outgoing customer order fulfillment
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Incoming (+Units)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Outgoing (-Units)</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4 pb-2">
            <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-200 pb-2">
              {movementDays.map(item => {
                const incHeight = (item.incoming / maxVolume) * 100;
                const outHeight = (item.outgoing / maxVolume) * 100;

                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      {/* Incoming bar */}
                      <div
                        style={{ height: `${incHeight}%` }}
                        className="w-1/2 max-w-[24px] bg-emerald-500 rounded-t-md transition-all group-hover:bg-emerald-600 relative"
                        title={`Incoming: ${item.incoming} units`}
                      />
                      {/* Outgoing bar */}
                      <div
                        style={{ height: `${outHeight}%` }}
                        className="w-1/2 max-w-[24px] bg-blue-500 rounded-t-md transition-all group-hover:bg-blue-600 relative"
                        title={`Outgoing: ${item.outgoing} units`}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <span className="text-slate-500 text-[10px] font-semibold uppercase block">Weekly Volume</span>
              <span className="font-bold text-slate-900 font-mono text-sm">640 Units In</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <span className="text-slate-500 text-[10px] font-semibold uppercase block">Fulfilled Orders</span>
              <span className="font-bold text-slate-900 font-mono text-sm">520 Units Out</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <span className="text-slate-500 text-[10px] font-semibold uppercase block">Net Buffer Delta</span>
              <span className="font-bold text-emerald-700 font-mono text-sm">+120 Units</span>
            </div>
          </div>
        </div>

        {/* Stock Alerts (Low Stock & Out of Stock) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Active Stock Alerts</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Requires immediate replenishment</p>
            </div>
            <button
              onClick={() => setActiveTab('reordering')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              View Rules →
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {outOfStockProducts.length === 0 && lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <span>All product stock buffers are within safety limits.</span>
              </div>
            ) : (
              <>
                {outOfStockProducts.map(p => (
                  <div
                    key={p.id}
                    className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-[10px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">
                        {p.sku}
                      </span>
                      <p className="font-bold text-slate-900 text-xs mt-1">{p.name}</p>
                      <span className="text-[10px] text-rose-700 font-semibold">0 {p.uom} in stock · Out of Stock</span>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenNewReceipt}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
                    >
                      Restock PO
                    </button>
                  </div>
                ))}

                {lowStockProducts.map(p => {
                  const currStock = getProductTotalStock(p, activeWarehouseId);
                  return (
                    <div
                      key={p.id}
                      className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          {p.sku}
                        </span>
                        <p className="font-bold text-slate-900 text-xs mt-1">{p.name}</p>
                        <span className="text-[10px] text-amber-700 font-semibold">
                          Current: {currStock} {p.uom} · Min: {p.minStock} {p.uom}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={onOpenNewReceipt}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
                      >
                        Order More
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3RD ROW: RECENT ACTIVITY STREAM + WAREHOUSE OVERVIEW */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-700" />
                <span>Recent Operational Activity</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Latest receipts, deliveries, and stock transfers</p>
            </div>
            <button
              onClick={() => setActiveTab('move-history')}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
            >
              Full Ledger →
            </button>
          </div>

          <div className="space-y-2.5">
            {recentActivities.map(act => (
              <div
                key={`${act.type}-${act.id}`}
                onClick={() => setActiveTab(act.tab)}
                className="p-3 bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    {act.type === 'receipt' && <ArrowDownLeft className="w-4 h-4 text-emerald-600" />}
                    {act.type === 'delivery' && <ArrowUpRight className="w-4 h-4 text-blue-600" />}
                    {act.type === 'transfer' && <ArrowLeftRight className="w-4 h-4 text-amber-600" />}
                    {act.type === 'adjustment' && <SlidersHorizontal className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{act.refNumber}</span>
                      <span className="text-[10px] text-slate-400 capitalize">· {act.type}</span>
                    </div>
                    <p className="font-semibold text-slate-800 text-[11px] mt-0.5 truncate max-w-xs">{act.title}</p>
                    <p className="text-[10px] text-slate-500 truncate">{act.subtitle}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    act.status === 'done'
                      ? 'bg-slate-200 text-slate-700'
                      : act.status === 'ready'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {act.status}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-1">
                    {new Date(act.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warehouse Overview (Stock Summary by Facility) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-700" />
                <span>Multi-Warehouse Utilization Summary</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Physical rack distribution and storage footprint</p>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
            >
              Manage Racks →
            </button>
          </div>

          <div className="space-y-3.5">
            {warehouses.map(wh => {
              const whTotalUnits = products.reduce((acc, p) => acc + getProductTotalStock(p, wh.id), 0);
              // Calculate synthetic utilization percentage (e.g. 75%, 60%, 45%) based on rack count & units
              const capacityMax = wh.locations.length * 150;
              const utilPct = Math.min(100, Math.round((whTotalUnits / Math.max(capacityMax, 1)) * 100));

              return (
                <div key={wh.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 mr-2">
                        {wh.code}
                      </span>
                      <span className="font-bold text-slate-900">{wh.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {whTotalUnits} units
                    </span>
                  </div>

                  {/* Utilization Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{wh.locations.length} Active Racks / Bays</span>
                      <span className="font-semibold text-slate-700">{utilPct}% Capacity Utilized</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${utilPct}%` }}
                        className={`h-full rounded-full transition-all ${
                          utilPct > 85 ? 'bg-rose-500' : utilPct > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
