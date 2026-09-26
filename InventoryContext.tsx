import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  Warehouse,
  ProductCategory,
  Receipt,
  DeliveryOrder,
  InternalTransfer,
  InventoryAdjustment,
  MoveHistoryItem,
  OperationStatus,
} from '../types/inventory';
import {
  INITIAL_WAREHOUSES,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_RECEIPTS,
  INITIAL_DELIVERIES,
  INITIAL_TRANSFERS,
  INITIAL_ADJUSTMENTS,
  INITIAL_MOVE_HISTORY,
} from '../data/mockData';
import { useAuth } from './AuthContext';

interface InventoryContextType {
  products: Product[];
  warehouses: Warehouse[];
  categories: ProductCategory[];
  receipts: Receipt[];
  deliveries: DeliveryOrder[];
  transfers: InternalTransfer[];
  adjustments: InventoryAdjustment[];
  moveHistory: MoveHistoryItem[];

  // Selected filters
  activeWarehouseId: string;
  setActiveWarehouseId: (id: string) => void;

  // Actions - Products
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Actions - Receipts
  createReceipt: (receipt: Omit<Receipt, 'id' | 'documentNumber' | 'dateCreated'>) => Receipt;
  updateReceipt: (id: string, updates: Partial<Receipt>) => void;
  validateReceipt: (id: string) => { success: boolean; message: string };

  // Actions - Delivery Orders
  createDeliveryOrder: (order: Omit<DeliveryOrder, 'id' | 'documentNumber' | 'dateCreated'>) => DeliveryOrder;
  updateDeliveryOrder: (id: string, updates: Partial<DeliveryOrder>) => void;
  validateDeliveryOrder: (id: string) => { success: boolean; message: string };

  // Actions - Transfers
  createTransfer: (transfer: Omit<InternalTransfer, 'id' | 'documentNumber' | 'dateCreated'>) => InternalTransfer;
  validateTransfer: (id: string) => { success: boolean; message: string };

  // Actions - Adjustments
  executeAdjustment: (data: {
    warehouseId: string;
    locationId: string;
    productId: string;
    countedQty: number;
    reason: InventoryAdjustment['reason'];
    notes?: string;
  }) => { success: boolean; message: string };

  // Settings
  addWarehouse: (warehouse: Omit<Warehouse, 'id'>) => void;
  addLocation: (warehouseId: string, location: Omit<Warehouse['locations'][0], 'id' | 'warehouseId'>) => void;
  addCategory: (category: Omit<ProductCategory, 'id'>) => void;

  // Helper Lookups
  getLocationName: (locationId?: string) => string;
  getWarehouseName: (warehouseId?: string) => string;
  getProductTotalStock: (product: Product, specificWarehouseId?: string) => number;
  getProductStockAtLocation: (productId: string, locationId: string) => number;

  // KPIs
  kpis: {
    totalProductsInStock: number;
    totalStockUnits: number;
    totalValuation: number;
    lowStockCount: number;
    outOfStockCount: number;
    pendingReceiptsCount: number;
    pendingDeliveriesCount: number;
    scheduledTransfersCount: number;
  };

  // Utilities
  resetToDemoData: () => void;
  exportLedgerToCsv: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('stocksense_products_v1');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    try {
      const saved = localStorage.getItem('stocksense_warehouses_v1');
      return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
    } catch {
      return INITIAL_WAREHOUSES;
    }
  });

  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    try {
      const saved = localStorage.getItem('stocksense_categories_v1');
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    try {
      const saved = localStorage.getItem('stocksense_receipts_v1');
      return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
    } catch {
      return INITIAL_RECEIPTS;
    }
  });

  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(() => {
    try {
      const saved = localStorage.getItem('stocksense_deliveries_v1');
      return saved ? JSON.parse(saved) : INITIAL_DELIVERIES;
    } catch {
      return INITIAL_DELIVERIES;
    }
  });

  const [transfers, setTransfers] = useState<InternalTransfer[]>(() => {
    try {
      const saved = localStorage.getItem('stocksense_transfers_v1');
      return saved ? JSON.parse(saved) : INITIAL_TRANSFERS;
    } catch {
      return INITIAL_TRANSFERS;
    }
  });

  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>(() => {
    try {
      const saved = localStorage.getItem('stocksense_adjustments_v1');
      return saved ? JSON.parse(saved) : INITIAL_ADJUSTMENTS;
    } catch {
      return INITIAL_ADJUSTMENTS;
    }
  });

  const [moveHistory, setMoveHistory] = useState<MoveHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('stocksense_movehistory_v1');
      return saved ? JSON.parse(saved) : INITIAL_MOVE_HISTORY;
    } catch {
      return INITIAL_MOVE_HISTORY;
    }
  });

  const [activeWarehouseId, setActiveWarehouseId] = useState<string>('all');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('stocksense_products_v1', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem('stocksense_warehouses_v1', JSON.stringify(warehouses));
  }, [warehouses]);
  useEffect(() => {
    localStorage.setItem('stocksense_categories_v1', JSON.stringify(categories));
  }, [categories]);
  useEffect(() => {
    localStorage.setItem('stocksense_receipts_v1', JSON.stringify(receipts));
  }, [receipts]);
  useEffect(() => {
    localStorage.setItem('stocksense_deliveries_v1', JSON.stringify(deliveries));
  }, [deliveries]);
  useEffect(() => {
    localStorage.setItem('stocksense_transfers_v1', JSON.stringify(transfers));
  }, [transfers]);
  useEffect(() => {
    localStorage.setItem('stocksense_adjustments_v1', JSON.stringify(adjustments));
  }, [adjustments]);
  useEffect(() => {
    localStorage.setItem('stocksense_movehistory_v1', JSON.stringify(moveHistory));
  }, [moveHistory]);

  // Lookup helpers
  const getLocationName = (locationId?: string): string => {
    if (!locationId) return 'N/A';
    for (const wh of warehouses) {
      const loc = wh.locations.find(l => l.id === locationId);
      if (loc) return `${loc.name} (${wh.code})`;
    }
    return locationId;
  };

  const getWarehouseName = (warehouseId?: string): string => {
    if (!warehouseId || warehouseId === 'all') return 'All Warehouses';
    const wh = warehouses.find(w => w.id === warehouseId);
    return wh ? wh.name : warehouseId;
  };

  const getProductStockAtLocation = (productId: string, locationId: string): number => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return 0;
    return prod.stockByLocation[locationId] || 0;
  };

  const getProductTotalStock = (product: Product, specificWarehouseId?: string): number => {
    if (!specificWarehouseId || specificWarehouseId === 'all') {
      return Object.values(product.stockByLocation || {}).reduce((sum, q) => sum + (q || 0), 0);
    }
    const wh = warehouses.find(w => w.id === specificWarehouseId);
    if (!wh) return 0;
    const whLocIds = new Set(wh.locations.map(l => l.id));
    return Object.entries(product.stockByLocation || {}).reduce((sum, [locId, q]) => {
      return whLocIds.has(locId) ? sum + (q || 0) : sum;
    }, 0);
  };

  // Products CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [newProduct, ...prev]);

    // If there is initial stock allocated, log opening balance moves
    const initialMoves: MoveHistoryItem[] = [];
    Object.entries(newProduct.stockByLocation || {}).forEach(([locId, qty]) => {
      if (qty > 0) {
        initialMoves.push({
          id: `mov-${Date.now()}-${locId}`,
          timestamp: new Date().toISOString(),
          documentType: 'adjustment',
          documentNumber: 'INIT-STOCK',
          productId: newProduct.id,
          productName: newProduct.name,
          sku: newProduct.sku,
          uom: newProduct.uom,
          fromLocationName: 'Opening Balance Setup',
          toLocationName: getLocationName(locId),
          quantityChange: qty,
          balanceAfter: qty,
          performedBy: currentUser?.name || 'System Admin',
          notes: 'Initial inventory intake upon product creation',
        });
      }
    });

    if (initialMoves.length > 0) {
      setMoveHistory(prev => [...initialMoves, ...prev]);
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Receipts: Incoming Stock
  const createReceipt = (receiptData: Omit<Receipt, 'id' | 'documentNumber' | 'dateCreated'>): Receipt => {
    const docNum = `REC-2026-${String(receipts.length + 1).padStart(3, '0')}`;
    const newReceipt: Receipt = {
      ...receiptData,
      id: `rec-${Date.now()}`,
      documentNumber: docNum,
      dateCreated: new Date().toISOString(),
    };
    setReceipts(prev => [newReceipt, ...prev]);
    return newReceipt;
  };

  const updateReceipt = (id: string, updates: Partial<Receipt>) => {
    setReceipts(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const validateReceipt = (id: string): { success: boolean; message: string } => {
    const receipt = receipts.find(r => r.id === id);
    if (!receipt) return { success: false, message: 'Receipt document not found' };
    if (receipt.status === 'done') return { success: false, message: 'Receipt has already been validated' };

    const targetLocId = receipt.targetLocationId;
    const targetLocName = getLocationName(targetLocId);
    const now = new Date().toISOString();
    const newMoves: MoveHistoryItem[] = [];

    // Increase stock for each line item
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts];
      receipt.lines.forEach(line => {
        const prodIndex = updatedProducts.findIndex(p => p.id === line.productId);
        if (prodIndex !== -1) {
          const prod = updatedProducts[prodIndex];
          const prevLocQty = prod.stockByLocation[targetLocId] || 0;
          const receivedQty = Number(line.receivedQty || line.orderedQty);
          const newLocQty = prevLocQty + receivedQty;

          updatedProducts[prodIndex] = {
            ...prod,
            stockByLocation: {
              ...prod.stockByLocation,
              [targetLocId]: newLocQty,
            },
          };

          newMoves.push({
            id: `mov-${Date.now()}-${line.productId}`,
            timestamp: now,
            documentType: 'receipt',
            documentNumber: receipt.documentNumber,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            uom: prod.uom,
            fromLocationName: `Vendor: ${receipt.supplierName}`,
            toLocationName: targetLocName,
            quantityChange: receivedQty,
            balanceAfter: newLocQty,
            performedBy: currentUser?.name || 'Inventory Manager',
            notes: `Goods received against ${receipt.documentNumber}`,
          });
        }
      });
      return updatedProducts;
    });

    // Mark receipt as Done
    setReceipts(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              status: 'done' as OperationStatus,
              dateReceived: now,
              validatedBy: currentUser?.name || 'Inventory Manager',
              validatedAt: now,
            }
          : r
      )
    );

    // Append to Move History (Stock Ledger)
    if (newMoves.length > 0) {
      setMoveHistory(prev => [...newMoves, ...prev]);
    }

    return { success: true, message: `Receipt ${receipt.documentNumber} successfully validated and stock credited!` };
  };

  // Delivery Orders: Outgoing Stock
  const createDeliveryOrder = (orderData: Omit<DeliveryOrder, 'id' | 'documentNumber' | 'dateCreated'>): DeliveryOrder => {
    const docNum = `DEL-2026-${String(deliveries.length + 1).padStart(3, '0')}`;
    const newOrder: DeliveryOrder = {
      ...orderData,
      id: `del-${Date.now()}`,
      documentNumber: docNum,
      dateCreated: new Date().toISOString(),
    };
    setDeliveries(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateDeliveryOrder = (id: string, updates: Partial<DeliveryOrder>) => {
    setDeliveries(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
  };

  const validateDeliveryOrder = (id: string): { success: boolean; message: string } => {
    const order = deliveries.find(d => d.id === id);
    if (!order) return { success: false, message: 'Delivery Order not found' };
    if (order.status === 'done') return { success: false, message: 'Delivery Order already fulfilled' };

    const srcLocId = order.sourceLocationId;
    const srcLocName = getLocationName(srcLocId);

    // Verify stock availability
    for (const line of order.lines) {
      const prod = products.find(p => p.id === line.productId);
      const available = prod?.stockByLocation[srcLocId] || 0;
      const needed = Number(line.pickedQty || line.orderedQty);
      if (available < needed) {
        return {
          success: false,
          message: `Insufficient stock for ${line.productName}. Available in ${srcLocName}: ${available} ${line.uom}, Required: ${needed} ${line.uom}. Please adjust or replenish stock first.`,
        };
      }
    }

    const now = new Date().toISOString();
    const newMoves: MoveHistoryItem[] = [];

    // Deduct stock
    setProducts(prevProducts => {
      const updated = [...prevProducts];
      order.lines.forEach(line => {
        const prodIndex = updated.findIndex(p => p.id === line.productId);
        if (prodIndex !== -1) {
          const prod = updated[prodIndex];
          const prevLocQty = prod.stockByLocation[srcLocId] || 0;
          const deliverQty = Number(line.pickedQty || line.orderedQty);
          const newLocQty = Math.max(0, prevLocQty - deliverQty);

          updated[prodIndex] = {
            ...prod,
            stockByLocation: {
              ...prod.stockByLocation,
              [srcLocId]: newLocQty,
            },
          };

          newMoves.push({
            id: `mov-${Date.now()}-${line.productId}`,
            timestamp: now,
            documentType: 'delivery',
            documentNumber: order.documentNumber,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            uom: prod.uom,
            fromLocationName: srcLocName,
            toLocationName: `Customer: ${order.customerName}`,
            quantityChange: -deliverQty,
            balanceAfter: newLocQty,
            performedBy: currentUser?.name || 'Warehouse Staff',
            notes: `Dispatched under ${order.documentNumber}`,
          });
        }
      });
      return updated;
    });

    setDeliveries(prev =>
      prev.map(d =>
        d.id === id
          ? {
              ...d,
              status: 'done' as OperationStatus,
              dateDelivered: now,
              validatedBy: currentUser?.name || 'Warehouse Staff',
              validatedAt: now,
            }
          : d
      )
    );

    if (newMoves.length > 0) {
      setMoveHistory(prev => [...newMoves, ...prev]);
    }

    return { success: true, message: `Delivery Order ${order.documentNumber} validated! Stock decremented and logged in ledger.` };
  };

  // Internal Transfers
  const createTransfer = (transferData: Omit<InternalTransfer, 'id' | 'documentNumber' | 'dateCreated'>): InternalTransfer => {
    const docNum = `TRF-2026-${String(transfers.length + 1).padStart(3, '0')}`;
    const newTransfer: InternalTransfer = {
      ...transferData,
      id: `trf-${Date.now()}`,
      documentNumber: docNum,
      dateCreated: new Date().toISOString(),
    };
    setTransfers(prev => [newTransfer, ...prev]);
    return newTransfer;
  };

  const validateTransfer = (id: string): { success: boolean; message: string } => {
    const trf = transfers.find(t => t.id === id);
    if (!trf) return { success: false, message: 'Transfer record not found' };
    if (trf.status === 'done') return { success: false, message: 'Transfer already completed' };

    const srcLocName = getLocationName(trf.sourceLocationId);
    const destLocName = getLocationName(trf.destLocationId);

    // Verify stock at source location
    for (const line of trf.lines) {
      const prod = products.find(p => p.id === line.productId);
      const available = prod?.stockByLocation[trf.sourceLocationId] || 0;
      if (available < line.quantity) {
        return {
          success: false,
          message: `Insufficient stock for ${line.productName} in source ${srcLocName}. Available: ${available} ${line.uom}, Requested: ${line.quantity} ${line.uom}`,
        };
      }
    }

    const now = new Date().toISOString();
    const newMoves: MoveHistoryItem[] = [];

    setProducts(prevProducts => {
      const updated = [...prevProducts];
      trf.lines.forEach(line => {
        const prodIndex = updated.findIndex(p => p.id === line.productId);
        if (prodIndex !== -1) {
          const prod = updated[prodIndex];
          const srcBefore = prod.stockByLocation[trf.sourceLocationId] || 0;
          const destBefore = prod.stockByLocation[trf.destLocationId] || 0;

          const srcAfter = srcBefore - line.quantity;
          const destAfter = destBefore + line.quantity;

          updated[prodIndex] = {
            ...prod,
            stockByLocation: {
              ...prod.stockByLocation,
              [trf.sourceLocationId]: srcAfter,
              [trf.destLocationId]: destAfter,
            },
          };

          newMoves.push({
            id: `mov-${Date.now()}-${line.productId}`,
            timestamp: now,
            documentType: 'transfer',
            documentNumber: trf.documentNumber,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            uom: prod.uom,
            fromLocationName: srcLocName,
            toLocationName: destLocName,
            quantityChange: line.quantity, // net moved
            balanceAfter: destAfter,
            performedBy: currentUser?.name || trf.performedBy,
            notes: trf.reason || 'Internal location transfer',
          });
        }
      });
      return updated;
    });

    setTransfers(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              status: 'done' as OperationStatus,
              validatedBy: currentUser?.name || 'Warehouse Staff',
              validatedAt: now,
            }
          : t
      )
    );

    if (newMoves.length > 0) {
      setMoveHistory(prev => [...newMoves, ...prev]);
    }

    return {
      success: true,
      message: `Transfer ${trf.documentNumber} executed successfully: moved from ${srcLocName} to ${destLocName}.`,
    };
  };

  // Inventory Adjustment (Physical Count vs System Count)
  const executeAdjustment = (data: {
    warehouseId: string;
    locationId: string;
    productId: string;
    countedQty: number;
    reason: InventoryAdjustment['reason'];
    notes?: string;
  }): { success: boolean; message: string } => {
    const prod = products.find(p => p.id === data.productId);
    if (!prod) return { success: false, message: 'Product not found' };

    const recordedQty = prod.stockByLocation[data.locationId] || 0;
    const diff = data.countedQty - recordedQty;
    const docNum = `ADJ-2026-${String(adjustments.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const locName = getLocationName(data.locationId);

    const newAdj: InventoryAdjustment = {
      id: `adj-${Date.now()}`,
      documentNumber: docNum,
      warehouseId: data.warehouseId,
      locationId: data.locationId,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      uom: prod.uom,
      recordedQty,
      countedQty: data.countedQty,
      differenceQty: diff,
      reason: data.reason,
      notes: data.notes,
      createdBy: currentUser?.name || 'Warehouse Staff',
      createdAt: now,
      status: 'done',
    };

    // Update product stock at that location to countedQty
    setProducts(prev =>
      prev.map(p =>
        p.id === prod.id
          ? {
              ...p,
              stockByLocation: {
                ...p.stockByLocation,
                [data.locationId]: data.countedQty,
              },
            }
          : p
      )
    );

    // Save adjustment record
    setAdjustments(prev => [newAdj, ...prev]);

    // Write to Move History (Stock Ledger)
    const newMove: MoveHistoryItem = {
      id: `mov-${Date.now()}`,
      timestamp: now,
      documentType: 'adjustment',
      documentNumber: docNum,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      uom: prod.uom,
      fromLocationName: diff < 0 ? locName : 'Adjustment Reconciliation',
      toLocationName: diff < 0 ? `Loss / Scrap (${data.reason})` : locName,
      quantityChange: diff,
      balanceAfter: data.countedQty,
      performedBy: currentUser?.name || 'Warehouse Staff',
      notes: data.notes || `Stock audit adjustment: ${diff >= 0 ? '+' : ''}${diff} ${prod.uom} (${data.reason})`,
    };

    setMoveHistory(prev => [newMove, ...prev]);

    return {
      success: true,
      message: `Adjustment ${docNum} validated! Stock at ${locName} calibrated from ${recordedQty} to ${data.countedQty} ${prod.uom} (${diff >= 0 ? '+' : ''}${diff}).`,
    };
  };

  // Settings
  const addWarehouse = (whData: Omit<Warehouse, 'id'>) => {
    const newWh: Warehouse = {
      ...whData,
      id: `wh-${Date.now()}`,
    };
    setWarehouses(prev => [...prev, newWh]);
  };

  const addLocation = (warehouseId: string, locationData: Omit<Warehouse['locations'][0], 'id' | 'warehouseId'>) => {
    setWarehouses(prev =>
      prev.map(wh => {
        if (wh.id === warehouseId) {
          const newLoc = {
            ...locationData,
            id: `loc-${Date.now()}`,
            warehouseId,
          };
          return {
            ...wh,
            locations: [...wh.locations, newLoc],
          };
        }
        return wh;
      })
    );
  };

  const addCategory = (catData: Omit<ProductCategory, 'id'>) => {
    const newCat: ProductCategory = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories(prev => [...prev, newCat]);
  };

  // KPIs calculation
  const kpis = useMemo(() => {
    let totalStockUnits = 0;
    let totalValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
      const stock = getProductTotalStock(p, activeWarehouseId);
      totalStockUnits += stock;
      totalValuation += stock * (p.costPrice || 0);

      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= p.minStock) {
        lowStockCount++;
      }
    });

    const pendingReceipts = receipts.filter(
      r =>
        (activeWarehouseId === 'all' || r.targetWarehouseId === activeWarehouseId) &&
        (r.status === 'waiting' || r.status === 'ready' || r.status === 'draft')
    ).length;

    const pendingDeliveries = deliveries.filter(
      d =>
        (activeWarehouseId === 'all' || d.sourceWarehouseId === activeWarehouseId) &&
        (d.status === 'waiting' || d.status === 'ready' || d.status === 'draft')
    ).length;

    const scheduledTransfers = transfers.filter(
      t =>
        (activeWarehouseId === 'all' ||
          t.sourceWarehouseId === activeWarehouseId ||
          t.destWarehouseId === activeWarehouseId) &&
        (t.status === 'waiting' || t.status === 'ready' || t.status === 'draft')
    ).length;

    return {
      totalProductsInStock: products.length,
      totalStockUnits,
      totalValuation,
      lowStockCount,
      outOfStockCount,
      pendingReceiptsCount: pendingReceipts,
      pendingDeliveriesCount: pendingDeliveries,
      scheduledTransfersCount: scheduledTransfers,
    };
  }, [products, receipts, deliveries, transfers, activeWarehouseId, warehouses]);

  // Export to CSV
  const exportLedgerToCsv = () => {
    const headers = [
      'Timestamp',
      'Document Type',
      'Document #',
      'Product SKU',
      'Product Name',
      'Quantity Change',
      'UoM',
      'From Location',
      'To Location',
      'Balance After',
      'Performed By',
      'Notes',
    ];

    const rows = moveHistory.map(m => [
      `"${m.timestamp}"`,
      `"${m.documentType.toUpperCase()}"`,
      `"${m.documentNumber}"`,
      `"${m.sku}"`,
      `"${m.productName.replace(/"/g, '""')}"`,
      m.quantityChange,
      `"${m.uom}"`,
      `"${(m.fromLocationName || '-').replace(/"/g, '""')}"`,
      `"${(m.toLocationName || '-').replace(/"/g, '""')}"`,
      m.balanceAfter ?? '-',
      `"${m.performedBy.replace(/"/g, '""')}"`,
      `"${(m.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `stocksense-stock-ledger-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetToDemoData = () => {
    localStorage.removeItem('stocksense_products_v1');
    localStorage.removeItem('stocksense_warehouses_v1');
    localStorage.removeItem('stocksense_categories_v1');
    localStorage.removeItem('stocksense_receipts_v1');
    localStorage.removeItem('stocksense_deliveries_v1');
    localStorage.removeItem('stocksense_transfers_v1');
    localStorage.removeItem('stocksense_adjustments_v1');
    localStorage.removeItem('stocksense_movehistory_v1');

    setProducts(INITIAL_PRODUCTS);
    setWarehouses(INITIAL_WAREHOUSES);
    setCategories(INITIAL_CATEGORIES);
    setReceipts(INITIAL_RECEIPTS);
    setDeliveries(INITIAL_DELIVERIES);
    setTransfers(INITIAL_TRANSFERS);
    setAdjustments(INITIAL_ADJUSTMENTS);
    setMoveHistory(INITIAL_MOVE_HISTORY);
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        warehouses,
        categories,
        receipts,
        deliveries,
        transfers,
        adjustments,
        moveHistory,
        activeWarehouseId,
        setActiveWarehouseId,
        addProduct,
        updateProduct,
        deleteProduct,
        createReceipt,
        updateReceipt,
        validateReceipt,
        createDeliveryOrder,
        updateDeliveryOrder,
        validateDeliveryOrder,
        createTransfer,
        validateTransfer,
        executeAdjustment,
        addWarehouse,
        addLocation,
        addCategory,
        getLocationName,
        getWarehouseName,
        getProductTotalStock,
        getProductStockAtLocation,
        kpis,
        resetToDemoData,
        exportLedgerToCsv,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
