import React, { useState, useRef, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Building2,
  Plus,
  Search,
  Bell,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Package,
  RotateCcw,
  AlertTriangle,
  X,
  Check,
  User as UserIcon,
  LogOut,
  ChevronDown,
  CheckCheck,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  onToggleMobileNav: () => void;
  setActiveTab: (tab: NavTab) => void;
  onOpenNewReceipt: () => void;
  onOpenNewDelivery: () => void;
  onOpenNewTransfer: () => void;
  onOpenNewAdjustment: () => void;
  onOpenNewProduct: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isCollapsed: boolean;
}

interface NotificationItem {
  id: string;
  type: 'low_stock' | 'receipt' | 'delivery' | 'transfer';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  targetTab: NavTab;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileNav,
  setActiveTab,
  onOpenNewReceipt,
  onOpenNewDelivery,
  onOpenNewTransfer,
  onOpenNewAdjustment,
  onOpenNewProduct,
  searchQuery,
  setSearchQuery,
  isCollapsed,
}) => {
  const {
    warehouses,
    activeWarehouseId,
    setActiveWarehouseId,
    kpis,
    products,
    receipts,
    deliveries,
    transfers,
  } = useInventory();
  const { currentUser, logout, isManager, switchDemoRole } = useAuth();

  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Dynamic interactive notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'low_stock',
      title: '⚠ Low stock alert',
      description: 'Steel Rods (RAW-STL-001) is approaching minimum reorder threshold.',
      timestamp: '10m ago',
      read: false,
      targetTab: 'reordering',
    },
    {
      id: 'notif-2',
      type: 'receipt',
      title: '📦 Receipt ready for inspection',
      description: 'REC-2026-002 from Global Workspace Ergonomics arrived at Receiving Bay.',
      timestamp: '35m ago',
      read: false,
      targetTab: 'receipts',
    },
    {
      id: 'notif-3',
      type: 'delivery',
      title: '🚚 Delivery ready for dispatch',
      description: 'DEL-2026-002 for Vanguard Industrial Systems staged at Dispatch Dock.',
      timestamp: '1h ago',
      read: false,
      targetTab: 'deliveries',
    },
    {
      id: 'notif-4',
      type: 'transfer',
      title: '🔄 Transfer completed',
      description: 'TRF-2026-001 moved 30 kg Steel Rods from Main Store → Production Rack.',
      timestamp: '2h ago',
      read: true,
      targetTab: 'transfers',
    },
  ]);

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowNewMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotificationMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Live search filtering
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: Array<{ id: string; title: string; subtitle: string; tab: NavTab }> = [];

    // Search Products
    products.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) {
        results.push({
          id: p.id,
          title: `${p.sku} · ${p.name}`,
          subtitle: `Product (${p.uom})`,
          tab: 'products',
        });
      }
    });

    // Search Receipts
    receipts.forEach(r => {
      if (r.documentNumber.toLowerCase().includes(q) || r.supplierName.toLowerCase().includes(q)) {
        results.push({
          id: r.id,
          title: `${r.documentNumber} · ${r.supplierName}`,
          subtitle: 'Incoming Receipt',
          tab: 'receipts',
        });
      }
    });

    // Search Deliveries
    deliveries.forEach(d => {
      if (d.documentNumber.toLowerCase().includes(q) || d.customerName.toLowerCase().includes(q)) {
        results.push({
          id: d.id,
          title: `${d.documentNumber} · ${d.customerName}`,
          subtitle: 'Outgoing Delivery',
          tab: 'deliveries',
        });
      }
    });

    // Search Transfers
    transfers.forEach(t => {
      if (t.documentNumber.toLowerCase().includes(q)) {
        results.push({
          id: t.id,
          title: `${t.documentNumber} · Transfer`,
          subtitle: 'Internal Transfer',
          tab: 'transfers',
        });
      }
    });

    return results.slice(0, 6);
  }, [searchQuery, products, receipts, deliveries, transfers]);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="h-16 px-4 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left: Mobile hamburger & Location Selector */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileNav}
            className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg lg:hidden cursor-pointer"
            aria-label="Open sidebar drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Facility Location Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs shadow-2xs hover:border-slate-300 transition-colors">
            <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={activeWarehouseId}
              onChange={e => setActiveWarehouseId(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Warehouses & Racks</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} ({wh.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Clean Global Search Input with Auto-Suggest */}
        <div className="flex-1 max-w-md hidden md:block relative" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search products, SKU, orders, transfers..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Matching Inventory Records
              </div>
              {searchResults.map(item => (
                <div
                  key={`${item.tab}-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.tab);
                    setShowSearchResults(false);
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <span className="font-semibold text-slate-900 block">{item.title}</span>
                    <span className="text-[10px] text-slate-500">{item.subtitle}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions: Notifications, + New Action, User Profile Dropdown */}
        <div className="flex items-center gap-3">
          
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-full border border-rose-200">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all as read</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        setActiveTab(n.targetTab);
                        setShowNotificationMenu(false);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        n.read
                          ? 'bg-slate-50/60 border-slate-100 text-slate-600 hover:bg-slate-50'
                          : 'bg-emerald-50/40 border-emerald-200/70 text-slate-900 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-bold text-xs">{n.title}</span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{n.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick "+ New Action" Button */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Action</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showNewMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Operational Workflows
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowNewMenu(false);
                    onOpenNewReceipt();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="block font-semibold">New Goods Receipt</span>
                    <span className="text-[10px] text-slate-500">Intake from supplier</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowNewMenu(false);
                    onOpenNewDelivery();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="block font-semibold">New Delivery Order</span>
                    <span className="text-[10px] text-slate-500">Pick and dispatch to customer</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowNewMenu(false);
                    onOpenNewTransfer();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                >
                  <ArrowLeftRight className="w-4 h-4 text-amber-600" />
                  <div>
                    <span className="block font-semibold">Internal Transfer</span>
                    <span className="text-[10px] text-slate-500">Move between warehouses or racks</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowNewMenu(false);
                    onOpenNewAdjustment();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="block font-semibold">Stock Adjustment</span>
                    <span className="text-[10px] text-slate-500">Reconcile physical counts vs system</span>
                  </div>
                </button>

                {/* Manager-Only Add Product */}
                {isManager && (
                  <>
                    <div className="my-1 border-t border-slate-100" />
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Catalog Management
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowNewMenu(false);
                        onOpenNewProduct();
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-slate-700" />
                      <div>
                        <span className="block font-semibold">Add New Product</span>
                        <span className="text-[10px] text-slate-500">SKU, UoM & safety stock</span>
                      </div>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Profile / Avatar Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-slate-300 overflow-hidden shrink-0">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser?.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser?.name.slice(0, 2).toUpperCase() || 'U'
                )}
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {currentUser?.name || 'Operator'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  {isManager ? 'Inventory Manager' : 'Warehouse Staff'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl mb-1 border border-slate-100">
                  <p className="font-bold text-slate-900">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-500">{currentUser?.email}</p>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 border ${
                    isManager ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}>
                    <Shield className="w-3 h-3" />
                    <span>{isManager ? 'Manager Permissions' : 'Staff Operations'}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 rounded-lg flex items-center gap-2 text-slate-700 cursor-pointer font-medium"
                >
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <span>View Full Profile</span>
                </button>

                <div className="p-2 border-t border-slate-100 my-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
                    Switch Test Persona
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        switchDemoRole('inventory_manager');
                        setShowUserMenu(false);
                      }}
                      className={`p-1.5 rounded-lg border text-left text-[11px] font-medium transition-all ${
                        isManager ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      Manager
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        switchDemoRole('warehouse_staff');
                        setShowUserMenu(false);
                      }}
                      className={`p-1.5 rounded-lg border text-left text-[11px] font-medium transition-all ${
                        !isManager ? 'bg-blue-50 border-blue-300 text-blue-800' : 'hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      Staff
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
