export type MaterialRequestPriority = 'Critical' | 'High' | 'Normal';

export type MaterialRequestStatus = 
  | 'Pending Verification' 
  | 'Verified & Sent to Purchase' 
  | 'RFQ Sent to Vendors' 
  | 'PO Issued' 
  | 'Goods Received in Inventory (GRN)'
  | string;

export type StockStatus = 'In Stock' | 'Low Stock' | 'Critical Shortage' | 'Out of Stock' | 'On Order' | string;
export type InventoryCategory = 'Piping & Fittings' | 'Piping & Flanges' | 'Structural Steel' | 'Valves & Flanges' | 'Fasteners & Gaskets' | 'Electrical & Instruments' | 'Civil & Safety' | string;

export interface MaterialRequestItem {
  id?: string;
  itemCode: string;
  name: string;
  category: string;
  quantity?: number;
  requestedQuantity?: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  reasonForRequest?: string;
  reason?: string;
  specCompliance?: string;
  [key: string]: any;
}

export interface MaterialRequest {
  id: string;
  mrNumber: string;
  projectId: string;
  workOrderNo: string;
  projectName: string;
  clientName: string;
  status: MaterialRequestStatus;
  priority: MaterialRequestPriority;
  requestedBy: string;
  requestedDate: string;
  targetDeliveryDate: string;
  totalEstimatedCost: number;
  notes?: string;
  approvalStatus?: 'Pending' | 'Approved by MD' | 'Rejected' | string;
  approvedBy?: string;
  approvedAt?: string;
  procurementOfficer?: string;
  items: MaterialRequestItem[];
  [key: string]: any;
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  sku?: string;
  name: string;
  category: InventoryCategory;
  yardLocation?: string;
  location?: string;
  currentStock: number;
  totalQuantity?: number;
  minSafetyStock?: number;
  minStockLevel?: number;
  allocatedToProjects?: number;
  allocatedStock?: number;
  availableStock: number;
  unit: string;
  standardUnitCost?: number;
  unitCost: number;
  status?: StockStatus;
  specifications?: string;
  specification: string;
  lastStockCheck?: string;
  [key: string]: any;
}

export interface ProjectMaterialReconciliationItem {
  id: string;
  itemCode: string;
  name: string;
  description?: string;
  specification?: string;
  category: InventoryCategory;
  unit: string;
  requiredQuantity: number;
  availableInStock: number;
  allocatedFromStock: number;
  shortageQuantity: number;
  totalShortageCost: number;
  allocatedFromYardQty?: number;
  shortfallQty?: number;
  stockStatus?: string;
  status?: string;
  unitCost: number;
  shortfallEstimatedCost?: number;
  inventoryItemId?: string;
  source?: string;
  boqDemandQty?: number;
  [key: string]: any;
}

export interface PurchaseOrderItem {
  id: string;
  itemCode: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalPrice?: number;
  unitCost?: number;
  totalCost?: number;
  [key: string]: any;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  mrRef: string;
  workOrderNo: string;
  projectName: string;
  vendorName: string;
  issueDate: string;
  promisedDeliveryDate: string;
  totalAmount: number;
  status: 'Draft' | 'Sent to Vendor' | 'Partially Delivered' | 'Delivered' | 'Cancelled' | string;
  paymentTerms: string;
  items: PurchaseOrderItem[];
  [key: string]: any;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  poNumber: string;
  mrNumber?: string;
  workOrderNo?: string;
  projectName?: string;
  receivedDate: string;
  receivedBy: string;
  warehouseLocation?: string;
  yardLocation?: string;
  inspectedBy?: string;
  qualityStatus?: 'Accepted' | 'Accepted with Deviation' | 'Rejected' | string;
  deliveryNoteNo?: string;
  notes?: string;
  items?: any[];
  [key: string]: any;
}

export function consolidateMaterialRequests(mrs: MaterialRequest[]): MaterialRequest[] {
  const map = new Map<string, MaterialRequest>();
  for (const mr of mrs) {
    const key = mr.projectId || mr.workOrderNo || mr.id;
    if (!map.has(key)) {
      map.set(key, { ...mr, items: [...(mr.items || [])] });
    }
  }
  return Array.from(map.values());
}
