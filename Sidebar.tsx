import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import {
  LayoutDashboard,
  Package,
  Boxes,
  BellRing,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Building2,
  Layers,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Warehouse as WarehouseIcon,
  ShieldAlert
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'products'
  | 'stock-overview'
  | 'reordering'
  | 'receipts'
  | 'deliveries'
  | 'transfers'
  | 'adjustments'
  | 'move-history'
  | 'settings'
  | 'categories'
  | 'profile';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { currentUser, logout, isManager } = useAuth();
  const { kpis } = useInventory();

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem('stocksense_sidebar_collapsed', JSON.stringify(next));
    } catch {}
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-2xs lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-slate-950 text-slate-200 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black tracking-tight shrink-0 shadow-xs shadow-emerald-500/20">
              <WarehouseIcon className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 overflow-hidden">
                <span className="text-sm font-black tracking-tight text-white block truncate">
                  STOCKSENSE
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block truncate">
                  Inventory Management
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={toggleCollapse}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Role Badge Banner */}
        {!isCollapsed && currentUser && (
          <div className="px-3 pt-3 pb-1">
            <div className="p-2.5 bg-slate-900/80 border border-slate-800/90 rounded-xl flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  currentUser.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-white block truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium block truncate">
                  {isManager ? 'Inventory Manager' : 'Warehouse Staff'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs">
          
          {/* SECTION 1: MAIN */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                MAIN
              </div>
            )}
            <button
              onClick={() => handleNavClick('dashboard')}
              title="Dashboard"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Dashboard</span>}
            </button>
          </div>

          {/* SECTION 2: INVENTORY */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                INVENTORY
              </div>
            )}
            <div className="space-y-1">
              {/* Products */}
              <button
                onClick={() => handleNavClick('products')}
                title="Products"
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all ${
                  activeTab === 'products'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Package className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">Products</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[11px] opacity-75 font-mono">{kpis.totalProductsInStock}</span>
                )}
              </button>

              {/* Stock Overview */}
              <button
                onClick={() => handleNavClick('stock-overview')}
                title="Stock Overview"
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all ${
                  activeTab === 'stock-overview'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Boxes className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">Stock Overview</span>}
              </button>

              {/* Reordering Rules */}
              <button
                onClick={() => handleNavClick('reordering')}
                title="Reordering Rules"
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all ${
                  activeTab === 'reordering'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <BellRing className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">Reordering Rules</span>}
                </div>
                {!isCollapsed && kpis.lowStockCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {kpis.lowStockCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* SECTION 3: OPERATIONS */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                OPERATIONS
              </div>
            )}
            <div className="space-y-1">
              {/* Receipts */}
              <button
                onClick={() => handleNavClick('receipts')}
                title="Receipts"
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all ${
                  activeTab === 'receipts'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-400 shrink-0" />
                  {!isCollapsed && <span className="truncate">Receipts</span>}
                </div>
                {!isCollapsed && kpis.pendingReceiptsCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {kpis.pendingReceiptsCount}
                  </span>
                )}
              </button>

              {/* Delivery Orders */}
              <button
                onClick={() => handleNavClick('deliveries')}
                title="Delivery Orders"
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all ${
                  activeTab === 'deliveries'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ArrowUpRight className="w-4 h-4 text-blue-400 shrink-0" />
                  {!isCollapsed && <span className="truncate">Delivery Orders</span>}
                </div>
                {!isCollapsed && kpis.pendingDeliveriesCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {kpis.pendingDeliveriesCount}
                  </span>
                )}
              </button>

              {/* Internal Transfers */}
              <button
                onClick={() => handleNavClick('transfers')}
                title="Internal Transfers"
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all ${
                  activeTab === 'transfers'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ArrowLeftRight className="w-4 h-4 text-amber-400 shrink-0" />
                  {!isCollapsed && <span className="truncate">Internal Transfers</span>}
                </div>
                {!isCollapsed && kpis.scheduledTransfersCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {kpis.scheduledTransfersCount}
                  </span>
                )}
              </button>

              {/* Inventory Adjustments */}
              <button
                onClick={() => handleNavClick('adjustments')}
                title="Inventory Adjustments"
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all ${
                  activeTab === 'adjustments'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 text-purple-400 shrink-0" />
                {!isCollapsed && <span className="truncate">Inventory Adjustments</span>}
              </button>

              {/* Stock Ledger */}
              <button
                onClick={() => handleNavClick('move-history')}
                title="Stock Ledger"
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all ${
                  activeTab === 'move-history'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <History className="w-4 h-4 text-cyan-400 shrink-0" />
                {!isCollapsed && <span className="truncate">Stock Ledger</span>}
              </button>
            </div>
          </div>

          {/* SECTION 4: SETTINGS */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                SETTINGS
              </div>
            )}
            <div className="space-y-1">
              {/* Warehouses & Racks */}
              <button
                onClick={() => handleNavClick('settings')}
                title="Warehouses & Racks"
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                {!isCollapsed && <span className="truncate">Warehouses & Racks</span>}
              </button>

              {/* Product Categories */}
              <button
                onClick={() => handleNavClick('categories')}
                title="Product Categories"
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all ${
                  activeTab === 'categories'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                {!isCollapsed && <span className="truncate">Product Categories</span>}
              </button>
            </div>
          </div>

          {/* SECTION 5: ACCOUNT */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                ACCOUNT
              </div>
            )}
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick('profile')}
                title="Profile"
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all ${
                  activeTab === 'profile'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                {!isCollapsed && <span className="truncate">Profile</span>}
              </button>

              <button
                onClick={logout}
                title="Logout"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">Logout</span>}
              </button>
            </div>
          </div>

        </div>

      </aside>
    </>
  );
};
