export type Role = 'inventory_manager' | 'warehouse_staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  assignedWarehouseId?: string;
}

export type DocumentType = 'receipt' | 'delivery' | 'transfer' | 'adjustment';

export type OperationStatus = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';

export interface Location {
  id: string;
  warehouseId: string;
  code: string;
  name: string;
  zone?: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  type: 'main' | 'production' | 'distribution' | 'storage';
  locations: Location[];
}

export interface ProductCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  uom: string; // e.g., 'kg', 'units', 'meters', 'boxes', 'liters'
  costPrice: number;
  sellingPrice: number;
  minStock: number; // Reorder threshold
  maxStock: number;
  reorderQty: number;
  stockByLocation: Record<string, number>; // locationId -> quantity
  imageUrl?: string;
  createdAt: string;
}

export interface ReceiptLine {
  productId: string;
  productName: string;
  sku: string;
  uom: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
}

export interface Receipt {
  id: string;
  documentNumber: string; // REC-2026-001
  supplierName: string;
  targetWarehouseId: string;
  targetLocationId: string;
  dateCreated: string;
  dateReceived?: string;
  status: OperationStatus;
  lines: ReceiptLine[];
  notes?: string;
  validatedBy?: string;
  validatedAt?: string;
}

export interface DeliveryLine {
  productId: string;
  productName: string;
  sku: string;
  uom: string;
  orderedQty: number;
  pickedQty: number;
  unitPrice: number;
}

export interface DeliveryOrder {
  id: string;
  documentNumber: string; // DEL-2026-001
  customerName: string;
  shippingAddress: string;
  sourceWarehouseId: string;
  sourceLocationId: string;
  dateCreated: string;
  dateDelivered?: string;
  status: OperationStatus;
  lines: DeliveryLine[];
  trackingNumber?: string;
  notes?: string;
  validatedBy?: string;
  validatedAt?: string;
}

export interface TransferLine {
  productId: string;
  productName: string;
  sku: string;
  uom: string;
  quantity: number;
}

export interface InternalTransfer {
  id: string;
  documentNumber: string; // TRF-2026-001
  sourceWarehouseId: string;
  sourceLocationId: string;
  destWarehouseId: string;
  destLocationId: string;
  dateCreated: string;
  status: OperationStatus;
  lines: TransferLine[];
  reason?: string;
  performedBy: string;
  validatedBy?: string;
  validatedAt?: string;
}

export type AdjustmentReason = 
  | 'damaged' 
  | 'spoilage' 
  | 'theft_loss' 
  | 'found_cycle_count' 
  | 'annual_audit' 
  | 'data_correction';

export interface InventoryAdjustment {
  id: string;
  documentNumber: string; // ADJ-2026-001
  warehouseId: string;
  locationId: string;
  productId: string;
  productName: string;
  sku: string;
  uom: string;
  recordedQty: number;
  countedQty: number;
  differenceQty: number; // counted - recorded
  reason: AdjustmentReason;
  notes?: string;
  createdBy: string;
  createdAt: string;
  status: 'done' | 'draft';
}

export interface MoveHistoryItem {
  id: string;
  timestamp: string;
  documentType: DocumentType;
  documentNumber: string;
  productId: string;
  productName: string;
  sku: string;
  uom: string;
  fromLocationName?: string;
  toLocationName?: string;
  quantityChange: number; // positive = added to location, negative = deducted
  balanceAfter?: number;
  performedBy: string;
  notes?: string;
}
