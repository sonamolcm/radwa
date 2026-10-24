'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Printer, 
  Eye, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  Truck, 
  Boxes, 
  Check, 
  X, 
  DollarSign, 
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  BadgeAlert,
  Send,
  Package,
  ChevronDown,
  RefreshCw,
  FolderOpen,
  Lock
} from 'lucide-react';
import { ProjectRFQ } from '../../types/crm';
import { 
  MaterialRequest, 
  MaterialRequestItem, 
  PurchaseOrder, 
  GoodsReceiptNote, 
  InventoryItem,
  StockStatus,
  consolidateMaterialRequests 
} from '../../types/inventory';
import { 
  INITIAL_MATERIAL_REQUESTS, 
  INITIAL_PURCHASE_ORDERS, 
  INITIAL_GOODS_RECEIPTS,
  INITIAL_INVENTORY_ITEMS 
} from '../../data/mockInventoryData';

interface PurchaseDashboardProps {
  projects?: ProjectRFQ[];
  currentUser: any;
  initialProjectId?: string;
  onNavigateToInventory?: (projectId?: string) => void;
  onNavigateToMaterialRequests?: (projectId?: string) => void;
  onBackToMainMenu?: () => void;
}

export const PurchaseDashboard: React.FC<PurchaseDashboardProps> = ({
  projects = [],
  currentUser,
  initialProjectId,
  onNavigateToInventory,
  onNavigateToMaterialRequests,
  onBackToMainMenu
}) => {
  // Shared persistent material requests (Strictly 1 MR per Project)
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>(() => {
    let list = INITIAL_MATERIAL_REQUESTS;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('radwa_material_requests');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed.map((mr: MaterialRequest) => {
              if (mr.id === 'mr-2026-0041' && (!mr.items || mr.items.length < 4)) {
                return {
                  ...INITIAL_MATERIAL_REQUESTS[0],
                  status: mr.status
                };
              }
              return mr;
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    const consolidated = consolidateMaterialRequests(list);
    if (typeof window !== 'undefined') {
      localStorage.setItem('radwa_material_requests', JSON.stringify(consolidated));
    }
    return consolidated;
  });

  // Shared persistent purchase orders (ensuring ALL 4 shortfall products are included)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    let list = INITIAL_PURCHASE_ORDERS;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('radwa_purchase_orders');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed.map((po: PurchaseOrder) => {
              if (po.id === 'po-2026-0081' && (!po.items || po.items.length < 4)) {
                return {
                  ...INITIAL_PURCHASE_ORDERS[0],
                  status: po.status || INITIAL_PURCHASE_ORDERS[0].status
                };
              }
              return po;
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('radwa_purchase_orders', JSON.stringify(list));
    }
    return list;
  });

  // Shared persistent goods receipts
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceiptNote[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('radwa_goods_receipts');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_GOODS_RECEIPTS;
  });

  // Central Inventory Items (for restock on PO delivery)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('radwa_inventory_items');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_INVENTORY_ITEMS;
  });

  // Auto-sanitize on mount so any outdated cached session with missed products is immediately repaired
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPos = localStorage.getItem('radwa_purchase_orders');
      if (storedPos) {
        try {
          const parsed: PurchaseOrder[] = JSON.parse(storedPos);
          let needsUpdate = false;
          const sanitized = parsed.map(po => {
            if (po.id === 'po-2026-0081' && (!po.items || po.items.length < 4)) {
              needsUpdate = true;
              return {
                ...INITIAL_PURCHASE_ORDERS[0],
                status: po.status || INITIAL_PURCHASE_ORDERS[0].status
              };
            }
            return po;
          });
          if (needsUpdate) {
            localStorage.setItem('radwa_purchase_orders', JSON.stringify(sanitized));
            setPurchaseOrders(sanitized);
          }
        } catch (e) {
          console.error(e);
        }
      }

      const storedMrs = localStorage.getItem('radwa_material_requests');
      if (storedMrs) {
        try {
          const parsed: MaterialRequest[] = JSON.parse(storedMrs);
          let mrUpdate = false;
          const sanitizedMrs = parsed.map(mr => {
            if (mr.id === 'mr-2026-0041' && (!mr.items || mr.items.length < 4)) {
              mrUpdate = true;
              return {
                ...INITIAL_MATERIAL_REQUESTS[0],
                status: mr.status
              };
            }
            return mr;
          });
          if (mrUpdate) {
            const consolidated = consolidateMaterialRequests(sanitizedMrs);
            localStorage.setItem('radwa_material_requests', JSON.stringify(consolidated));
            setMaterialRequests(consolidated);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const saveMaterialRequests = (newReqs: MaterialRequest[]) => {
    const consolidated = consolidateMaterialRequests(newReqs);
    setMaterialRequests(consolidated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('radwa_material_requests', JSON.stringify(consolidated));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const savePurchaseOrders = (newPos: PurchaseOrder[]) => {
    setPurchaseOrders(newPos);
    if (typeof window !== 'undefined') {
      localStorage.setItem('radwa_purchase_orders', JSON.stringify(newPos));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const saveGoodsReceipts = (newGrns: GoodsReceiptNote[]) => {
    setGoodsReceipts(newGrns);
    if (typeof window !== 'undefined') {
      localStorage.setItem('radwa_goods_receipts', JSON.stringify(newGrns));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const saveInventoryItems = (newItems: InventoryItem[]) => {
    setInventoryItems(newItems);
    if (typeof window !== 'undefined') {
      localStorage.setItem('radwa_inventory_items', JSON.stringify(newItems));
      window.dispatchEvent(new Event('storage'));
    }
  };

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --------------------------------------------------------------------------
  // PROJECT-FIRST VIEW ARCHITECTURE (AS EXPLICITLY REQUESTED BY USER)
  // User's audio: "Purchase-inte dashboard open cheyyumpo athil aadyam oro oro
  //  project-ukal list cheythu varanam. Aa list cheythathil oro project click
  //  cheyyumpo aa project-il enthokkeyaanu purchase cheyyende ennullathu kaanikkanam."
  // --------------------------------------------------------------------------
  const [viewMode, setViewMode] = useState<'project_list' | 'project_detail'>(() => {
    return initialProjectId ? 'project_detail' : 'project_list';
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    if (initialProjectId) return initialProjectId;
    return projects[0]?.id || 'rfq-2026-0145';
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Active Selected Project
  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId || p.workOrderNo === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  // Active Project's Single Consolidated Material Request
  const selectedProjectMr = useMemo(() => {
    if (!selectedProject) return null;
    return materialRequests.find(mr => 
      (mr.workOrderNo && mr.workOrderNo === selectedProject.workOrderNo) || 
      (mr.projectId && mr.projectId === selectedProject.id)
    ) || null;
  }, [materialRequests, selectedProject]);

  // Active Project's Purchase Orders
  const selectedProjectPos = useMemo(() => {
    if (!selectedProject) return [];
    return purchaseOrders.filter(po => 
      (po.workOrderNo && po.workOrderNo === selectedProject.workOrderNo) ||
      (selectedProjectMr && po.mrNumber === selectedProjectMr.mrNumber)
    );
  }, [purchaseOrders, selectedProject, selectedProjectMr]);

  // Active Project's Goods Receipts (GRN)
  const selectedProjectGrns = useMemo(() => {
    if (!selectedProject) return [];
    return goodsReceipts.filter(grn => 
      (grn.workOrderNo && grn.workOrderNo === selectedProject.workOrderNo) ||
      (selectedProjectMr && grn.mrNumber === selectedProjectMr.mrNumber)
    );
  }, [goodsReceipts, selectedProject, selectedProjectMr]);

  // Filtered Projects for the Directory view
  const filteredProjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return projects;
    return projects.filter(p => 
      p.workOrderNo.toLowerCase().includes(q) ||
      p.proposedProjectName.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  // --------------------------------------------------------------------------
  // CREATE PURCHASE ORDER (PO) MODAL
  // --------------------------------------------------------------------------
  const [isCreatePoModalOpen, setIsCreatePoModalOpen] = useState(false);
  const [selectedMrForPo, setSelectedMrForPo] = useState<MaterialRequest | null>(null);
  const [formVendorName, setFormVendorName] = useState('Arabian Pipe Company (APC)');
  const [formPaymentTerms, setFormPaymentTerms] = useState('Net 30 Days after GRN Delivery');
  const [formDeliveryDate, setFormDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().slice(0, 10);
  });

  const handleOpenCreatePo = (mr: MaterialRequest) => {
    setSelectedMrForPo(mr);
    if (mr.items[0]?.preferredVendor) {
      setFormVendorName(mr.items[0].preferredVendor);
    }
    setIsCreatePoModalOpen(true);
  };

  const handleConfirmCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMrForPo) return;

    const newPoNumber = `PO-RAD-2026-${String(purchaseOrders.length + 82).padStart(4, '0')}`;
    const newPo: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: newPoNumber,
      mrRef: selectedMrForPo.mrNumber,
      mrNumber: selectedMrForPo.mrNumber,
      workOrderNo: selectedMrForPo.workOrderNo,
      projectName: selectedMrForPo.projectName,
      vendorName: formVendorName,
      items: (selectedMrForPo.items || []).map((it, idx) => ({
        id: it.id || `poi-${idx}`,
        itemCode: it.itemCode,
        name: it.name,
        quantity: it.requestedQuantity || it.quantity || 1,
        unit: it.unit || 'NOS',
        unitPrice: it.unitCost || 0,
        totalPrice: it.totalCost || ((it.requestedQuantity || 1) * (it.unitCost || 0)),
      })),
      totalAmount: selectedMrForPo.totalEstimatedCost,
      issueDate: new Date().toISOString().slice(0, 10),
      expectedDeliveryDate: formDeliveryDate,
      promisedDeliveryDate: formDeliveryDate,
      paymentTerms: formPaymentTerms,
      status: 'PO Issued'
    };

    savePurchaseOrders([newPo, ...purchaseOrders]);

    // Update MR status to 'PO Issued'
    const updatedMrs = materialRequests.map(mr => {
      if (mr.id === selectedMrForPo.id) {
        return { ...mr, status: 'PO Issued' as const, poNumber: newPoNumber };
      }
      return mr;
    });
    saveMaterialRequests(updatedMrs);

    setIsCreatePoModalOpen(false);
    showToast(`🛒 Issued Purchase Order ${newPoNumber} to ${formVendorName}!`);
  };

  // Vendor Ships Goods -> Dispatches to Inventory Yard for GRN
  const handleShipGoodsToYard = (po: PurchaseOrder) => {
    const newGrnNumber = `GRN-2026-${String(goodsReceipts.length + 13).padStart(4, '0')}`;
    
    // Create new Inbound Goods Receipt Note
    const newGrn: GoodsReceiptNote = {
      id: `grn-${Date.now()}`,
      grnNumber: newGrnNumber,
      poNumber: po.poNumber,
      mrNumber: po.mrNumber,
      workOrderNo: po.workOrderNo,
      projectName: po.projectName,
      receivedDate: new Date().toISOString().slice(0, 10),
      receivedBy: 'Sultan Al-Otaibi (Central Yard Gate 2)',
      warehouseLocation: 'Riyadh Central Yard - Inbound Gate 2',
      deliveryNoteNo: `DN-${po.vendorName.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      items: po.items.map(it => ({
        itemCode: it.itemCode,
        name: it.name,
        quantityReceived: it.requestedQuantity,
        unit: it.unit,
        inspectionStatus: 'Passed QA/QC'
      })),
      notes: `Dispatched from Purchase Order ${po.poNumber}. Transferred to Inventory for warehouse acceptance.`
    };

    saveGoodsReceipts([newGrn, ...goodsReceipts]);

    const updatedPos = purchaseOrders.map(p => {
      if (p.id === po.id) {
        return { ...p, status: 'Vendor Shipped' as const, grnNumber: newGrnNumber };
      }
      return p;
    });
    savePurchaseOrders(updatedPos);

    showToast(`🚚 Goods shipped to Yard! Inbound ${newGrnNumber} created.`);
  };

  // --------------------------------------------------------------------------
  // WORKFLOW COMPLETION: ACCEPT DELIVERY & RESTOCK TO CENTRAL INVENTORY (GRN)
  // (User's audio: "Purchase cheytha saadhanangal okke inventory-kku varanam.
  //  Athaanu workflow... Inventory-kku varumpo ee requirement sheet athin anusarichu
  //  update aavanam. Ee project-inu vendiyulla ella saadhanangalum, required items okke
  //  nammude inventory-il vannu, ini onnum material request polethonnum venda ennullathu
  //  automatically avide update aavanam. Manasilaayille?")
  // --------------------------------------------------------------------------
  const handleRestockPoIntoInventory = (po: PurchaseOrder) => {
    // 1. Increment central inventory stock for each item in the PO
    const currentInv: InventoryItem[] = typeof window !== 'undefined' && localStorage.getItem('radwa_inventory_items')
      ? JSON.parse(localStorage.getItem('radwa_inventory_items')!)
      : inventoryItems;

    const matchedItemCodes = new Set<string>();

    const updatedInv = currentInv.map((invItem: InventoryItem) => {
      const poItemMatch = po.items.find(pi => 
        (pi.itemCode && pi.itemCode.toLowerCase() === invItem.itemCode.toLowerCase()) ||
        pi.name.toLowerCase().trim() === invItem.name.toLowerCase().trim()
      );

      if (poItemMatch) {
        matchedItemCodes.add(poItemMatch.itemCode || poItemMatch.name);
        const addQty = Number(poItemMatch.quantity || poItemMatch.requestedQuantity || 0);
        const newCurrent = invItem.currentStock + addQty;
        const newAvailable = Math.max(0, newCurrent - (invItem.reservedQuantity || 0));
        return {
          ...invItem,
          currentStock: newCurrent,
          availableStock: newAvailable,
          status: (newAvailable > (invItem.minStockAlert || 0) ? 'In Stock' : (newAvailable === 0 ? 'Out of Stock' : 'Low Stock')) as StockStatus,
          lastRestocked: new Date().toISOString().slice(0, 10)
        };
      }
      return invItem;
    });

    // Safeguard: If any item in PO is not in central catalog yet, add it so nothing is ever missed
    po.items.forEach((pi, idx) => {
      const codeOrName = pi.itemCode || pi.name;
      if (!matchedItemCodes.has(codeOrName)) {
        updatedInv.push({
          id: `inv-restocked-${Date.now()}-${idx}`,
          itemCode: pi.itemCode || `MAT-REC-${Date.now()}-${idx}`,
          name: pi.name,
          specification: pi.specification || 'Purchased project material',
          category: pi.category || 'Piping & Flanges',
          unit: pi.unit || 'NOS',
          currentStock: Number(pi.quantity || pi.requestedQuantity || 0),
          reservedQuantity: 0,
          availableStock: Number(pi.quantity || pi.requestedQuantity || 0),
          minStockAlert: 5,
          unitCost: Number(pi.unitCost || pi.unitPrice || 0),
          warehouseLocation: 'Riyadh Central Yard - Received Inbound',
          lastRestocked: new Date().toISOString().slice(0, 10),
          status: 'In Stock',
          supplierName: po.vendorName,
          barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`
        });
      }
    });

    saveInventoryItems(updatedInv);

    // 2. Create Goods Receipt Note (GRN)
    const newGrnNumber = po.grnNumber || `GRN-2026-${String(goodsReceipts.length + 14).padStart(4, '0')}`;
    const newGrn: GoodsReceiptNote = {
      id: `grn-${Date.now()}`,
      grnNumber: newGrnNumber,
      poNumber: po.poNumber,
      mrNumber: po.mrNumber,
      workOrderNo: po.workOrderNo,
      projectName: po.projectName,
      receivedDate: new Date().toISOString().slice(0, 10),
      receivedBy: currentUser?.name || 'Sultan Al-Otaibi (Warehouse Receiver)',
      warehouseLocation: 'Riyadh Central Yard - Inbound Dock 3',
      deliveryNoteNo: `DN-${po.vendorName.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      items: po.items.map(it => ({
        itemCode: it.itemCode,
        name: it.name,
        quantityReceived: it.requestedQuantity,
        unit: it.unit,
        inspectionStatus: 'Passed QA/QC'
      })),
      notes: `Official GRN acceptance for ${po.poNumber}. All ${po.items.length} items physically verified and restocked into warehouse inventory.`
    };
    saveGoodsReceipts([newGrn, ...goodsReceipts]);

    // 3. Update PO status to Completed
    const updatedPos = purchaseOrders.map(p => {
      if (p.id === po.id) {
        return { ...p, status: 'Completed (Stock Updated)' as const, grnNumber: newGrnNumber };
      }
      return p;
    });
    savePurchaseOrders(updatedPos);

    // 4. Update MR status to Goods Received / Restocked
    const updatedMrs = materialRequests.map(mr => {
      if (mr.mrNumber === po.mrNumber || mr.workOrderNo === po.workOrderNo) {
        return { 
          ...mr, 
          status: 'Goods Received in Inventory (GRN)' as const,
          notes: `${mr.notes ? mr.notes + ' • ' : ''}100% of all ${po.items.length} materials received under ${po.poNumber} & ${newGrnNumber}. Restocked in Central Yard.` 
        };
      }
      return mr;
    });
    saveMaterialRequests(updatedMrs);

    showToast(`🎉 100% of materials (${po.items.length} products) from ${po.poNumber} received & restocked into Central Warehouse! ${newGrnNumber} issued.`);
  };

  const getMrStatusBadge = (status: MaterialRequest['status']) => {
    switch (status) {
      case 'Pending Verification':
        return 'bg-amber-50 text-amber-900 border-amber-300 font-bold';
      case 'Verified & Sent to Purchase':
        return 'bg-blue-50 text-blue-800 border-blue-200 font-bold';
      case 'RFQ Sent to Vendors':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'PO Issued':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold';
      case 'Goods Received in Inventory (GRN)':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-black';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white rounded-xl shadow-2xl p-4 border border-slate-800 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="text-xs font-semibold leading-relaxed">
            {toastMessage}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW 1: PROJECTS PROCUREMENT DIRECTORY (LANDING SCREEN AS REQUESTED) */}
      {/* ==================================================================== */}
      {viewMode === 'project_list' ? (
        <div className="space-y-6">
          
          {/* Top Banner Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white p-6 shadow-xl border border-slate-800">
            <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-cyan-500/30">
                    Radwa Procurement & Supply Chain
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-300 font-mono">Stage 3: Project Purchase Operations</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                  <ShoppingCart className="w-6 h-6 text-cyan-400" />
                  <span>Purchase & Procurement Projects Directory</span>
                </h1>
                <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                  Select an active project below to view requested shortfall materials, issue official Vendor Purchase Orders (PO), and confirm goods restocked into warehouse inventory.
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by WO#, Project, Client..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>

            {/* 4 Executive KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Projects</span>
                <span className="text-xl font-black text-white mt-0.5 block font-mono">{filteredProjects.length} Projects</span>
                <span className="text-[10px] text-cyan-300">Procurement Tracked</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Purchase Orders</span>
                <span className="text-xl font-black text-cyan-400 mt-0.5 block font-mono">
                  {purchaseOrders.length} POs Issued
                </span>
                <span className="text-[10px] text-slate-400">Vendor Commitments</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Committed Budget</span>
                <span className="text-xl font-black text-emerald-400 mt-0.5 block font-mono">
                  SAR {purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-300">Contracted Value</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">GRN Receipts Logged</span>
                <span className="text-xl font-black text-amber-300 mt-0.5 block font-mono">
                  {goodsReceipts.length} Accepted
                </span>
                <span className="text-[10px] text-amber-200">Restocked into Inventory</span>
              </div>
            </div>
          </div>

          {/* Project Procurement Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((proj) => {
              const projectMr = materialRequests.find(mr => 
                (mr.workOrderNo && mr.workOrderNo === proj.workOrderNo) || 
                (mr.projectId && mr.projectId === proj.id)
              );

              const projectPos = purchaseOrders.filter(po => 
                (po.workOrderNo && po.workOrderNo === proj.workOrderNo) ||
                (projectMr && po.mrNumber === projectMr.mrNumber)
              );

              const isFullyRestocked = projectMr?.status === 'Goods Received in Inventory (GRN)';

              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    setSelectedProjectId(proj.id);
                    setViewMode('project_detail');
                  }}
                  className="group relative p-5 rounded-3xl bg-white border border-slate-200 hover:border-cyan-500 hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Top Bar with WO Badge & Status */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 border border-blue-200 group-hover:bg-cyan-600 group-hover:text-white transition">
                        {proj.workOrderNo}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {proj.status || 'Active Execution'}
                      </span>
                    </div>

                    {/* Project Name */}
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-cyan-700 transition line-clamp-2">
                      {proj.proposedProjectName}
                    </h3>

                    {/* Client */}
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{proj.clientName}</span>
                    </div>
                  </div>

                  {/* Procurement Demand State */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Inbound Shortfalls:</span>
                      {isFullyRestocked ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>100% In-Stock • Restocked</span>
                        </span>
                      ) : projectMr ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getMrStatusBadge(projectMr.status)}`}>
                          {projectMr.status}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">No Shortfalls</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="text-slate-600">
                        {projectMr ? `${projectMr.items.length} Required Materials` : '0 Pending Items'}
                      </span>
                      <span className={projectMr ? 'text-emerald-700' : 'text-slate-400'}>
                        {projectMr ? `SAR ${projectMr.totalEstimatedCost.toLocaleString()}` : 'SAR 0'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Strip with PO Count & CTA */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <ShoppingCart className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="font-bold">{projectPos.length} Purchase Orders</span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-cyan-600 group-hover:text-cyan-700 font-bold text-xs group-hover:translate-x-1 transition-transform">
                      <span>Open Purchase Desk</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ==================================================================== */
        /* VIEW 2: PROJECT PURCHASE OPERATIONS DESK (DETAIL VIEW)              */
        /* ==================================================================== */
        <div className="space-y-6">
          
          {/* Back Button & Project Switcher Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setViewMode('project_list')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-2 cursor-pointer w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to All Projects Directory</span>
            </button>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:inline">Active Project:</span>
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 border border-blue-200">
                  {selectedProject?.workOrderNo}
                </span>
                <span className="text-xs font-bold text-slate-800 truncate max-w-xs hidden md:inline">
                  {selectedProject?.proposedProjectName}
                </span>
              </div>

              {onNavigateToInventory && (
                <button
                  type="button"
                  onClick={() => onNavigateToInventory(selectedProject?.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Boxes className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Inspect Inventory Stock</span>
                </button>
              )}
            </div>
          </div>

          {/* Project Procurement Summary Banner */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-blue-600 text-white shadow-xs">
                    {selectedProject?.workOrderNo}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-600 font-medium">
                    Client: <strong className="text-slate-900">{selectedProject?.clientName}</strong>
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {selectedProject?.proposedProjectName}
                </h2>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Shortfall Procurement Budget
                </span>
                <span className="text-xl font-black text-emerald-600 font-mono">
                  SAR {selectedProjectMr ? selectedProjectMr.totalEstimatedCost.toLocaleString() : '0'}
                </span>
              </div>
            </div>

            {/* Alert Banner: When MR is pending verification (Strict Department Gatekeeper) */}
            {selectedProjectMr && selectedProjectMr.status === 'Pending Verification' && (
              <div className="p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shrink-0 mt-0.5 shadow-md shadow-amber-500/20">
                    <Lock className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase border border-amber-500/40">
                        🔒 GATEKEEPER ACTIVE: PO CREATION LOCKED
                      </span>
                      <span className="text-xs text-amber-400 font-mono">Requisition: {selectedProjectMr.mrNumber}</span>
                    </div>
                    <h4 className="text-sm font-black text-white">
                      Pending Technical Engineering Verification in Material Requests Hub
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      This Material Request was generated from Warehouse Inventory but has not yet been verified by the Lead Estimator / Material QA Engineer. In accordance with Radwa ERP governance, official Purchase Orders (PO) cannot be issued until the requisition is verified and authorized in the MR Hub.
                    </p>
                  </div>
                </div>

                <div className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold shrink-0 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Awaiting Material Desk Sign-Off</span>
                </div>
              </div>
            )}

            {/* ==================================================================== */}
            {/* SECTION 1: INBOUND MATERIAL REQUISITION (ITEMS TO BUY)               */}
            {/* ==================================================================== */}
            <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-xs">
              <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-cyan-500/30">
                      APPROVED SHORTFALL MATERIAL REQUISITION (MR)
                    </span>
                    <span className="font-mono text-cyan-300 font-black text-sm">
                      {selectedProjectMr?.mrNumber || 'NO ACTIVE MR'}
                    </span>
                    {selectedProjectMr && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getMrStatusBadge(selectedProjectMr.status)}`}>
                        {selectedProjectMr.status}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300">
                    Verified items dispatched from Warehouse Inventory to Procurement. Requisitioned by: <strong className="text-white">{selectedProjectMr?.requestedBy || 'Central Warehouse'}</strong>
                  </p>
                </div>

                {/* Create PO CTA Button */}
                <div>
                  {selectedProjectMr && selectedProjectMr.status === 'Pending Verification' ? (
                    <div className="flex items-center gap-2">
                      <span className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold flex items-center gap-2 cursor-not-allowed">
                        <Lock className="w-4 h-4 text-amber-400" />
                        <span>PO Locked: Awaiting MR Verification</span>
                      </span>
                    </div>
                  ) : selectedProjectMr && selectedProjectMr.status !== 'Goods Received in Inventory (GRN)' ? (
                    <button
                      type="button"
                      onClick={() => handleOpenCreatePo(selectedProjectMr)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>+ Create Official Purchase Order (PO)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : selectedProjectMr?.status === 'Goods Received in Inventory (GRN)' ? (
                    <span className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>100% Restocked in Yard (GRN Complete)</span>
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Material Items Table */}
              {selectedProjectMr ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3 text-center">#</th>
                        <th className="py-3 px-4">Item SKU & Technical Specification</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-2 text-center">Unit</th>
                        <th className="py-3 px-3 text-center bg-rose-50 text-rose-900 font-black border-x border-rose-200">
                          Shortfall to Purchase (Qty)
                        </th>
                        <th className="py-3 px-3 text-right">Est. Unit Rate</th>
                        <th className="py-3 px-4 text-right">Line Total (SAR)</th>
                        <th className="py-3 px-3">Suggested Vendor</th>
                        <th className="py-3 px-3 text-center">Procurement Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {selectedProjectMr.items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-[10px] text-cyan-700 font-black tracking-wide">
                              {item.itemCode}
                            </div>
                            <div className="font-bold text-slate-900 text-xs mt-0.5">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate max-w-sm">
                              {item.specification}
                            </div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center font-mono font-bold text-slate-600">
                            {item.unit}
                          </td>
                          <td className="py-3 px-3 text-center bg-rose-50/60 border-x border-rose-200">
                            <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-rose-600 text-white shadow-xs">
                              {item.requestedQuantity} {item.unit}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-600">
                            SAR {item.unitCost.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            <span className="text-rose-700 font-black">
                              SAR {item.totalCost.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[11px] font-medium text-slate-700 truncate max-w-[160px] block">
                              {item.preferredVendor || 'Aramco Approved Stockist'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {selectedProjectMr.status === 'Goods Received in Inventory (GRN)' ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                ✓ Restocked
                              </span>
                            ) : selectedProjectMr.status === 'PO Issued' ? (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                                PO Placed
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                Pending PO
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No shortfall Material Request submitted for this project.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Use Inventory & Stock Reconciler to calculate demands and dispatch an MR.</p>
                </div>
              )}
            </div>

            {/* ==================================================================== */}
            {/* SECTION 2: VENDOR PURCHASE ORDERS (PO) FOR THIS PROJECT              */}
            {/* ==================================================================== */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-indigo-600" />
                    <span>Vendor Purchase Orders (PO) — {selectedProjectPos.length} Issued</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Legal procurement contracts issued to suppliers. Once goods arrive, click <strong>"Accept Delivery & Restock to Central Warehouse (GRN)"</strong> to update stock.
                  </p>
                </div>

                {selectedProjectMr && (
                  <button
                    type="button"
                    onClick={() => handleOpenCreatePo(selectedProjectMr)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Issue Another PO</span>
                  </button>
                )}
              </div>

              {selectedProjectPos.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No Purchase Orders Issued Yet for this Project</p>
                  {selectedProjectMr && (
                    <button
                      type="button"
                      onClick={() => handleOpenCreatePo(selectedProjectMr)}
                      className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Issue Official PO Now</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedProjectPos.map((po) => (
                    <div 
                      key={po.id}
                      className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-xs"
                    >
                      {/* PO Header Strip */}
                      <div className="p-4 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono text-cyan-400 font-black text-sm">
                              {po.poNumber}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-300">
                              Vendor: <strong className="text-white">{po.vendorName}</strong>
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              po.status === 'Completed (Stock Updated)'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : po.status === 'Vendor Shipped'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            }`}>
                              {po.status}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400">
                            MR Ref: <span className="font-mono text-cyan-300">{po.mrNumber}</span> • Issued: <span className="font-mono text-white">{po.issueDate}</span> • Expected Site Target: <span className="font-mono text-cyan-200 font-bold">{po.expectedDeliveryDate}</span> • Terms: {po.paymentTerms}
                          </div>
                        </div>

                        {/* PO Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {po.status === 'PO Issued' && (
                            <button
                              type="button"
                              onClick={() => handleShipGoodsToYard(po)}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>🚚 Confirm Vendor Dispatch (In-Transit)</span>
                            </button>
                          )}

                          {po.status !== 'Completed (Stock Updated)' ? (
                            <button
                              type="button"
                              onClick={() => handleRestockPoIntoInventory(po)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer"
                            >
                              <Boxes className="w-4 h-4 text-emerald-200" />
                              <span>📦 Accept Delivery & Restock to Central Warehouse (GRN)</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Restocked in Inventory Stock</span>
                              </span>

                              {onNavigateToInventory && (
                                <button
                                  type="button"
                                  onClick={() => onNavigateToInventory(selectedProject?.id)}
                                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <span>Inspect in Inventory Reconciler</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* PO Items Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px]">
                            <tr>
                              <th className="py-2.5 px-3 text-center">#</th>
                              <th className="py-2.5 px-4">Item SKU & Name</th>
                              <th className="py-2.5 px-3">Unit</th>
                              <th className="py-2.5 px-3 text-center">Purchased Qty</th>
                              <th className="py-2.5 px-3 text-right">Unit Rate (SAR)</th>
                              <th className="py-2.5 px-4 text-right">Line Total (SAR)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-700">
                            {po.items.map((it, i) => (
                              <tr key={it.id || i} className="hover:bg-slate-50/60 transition">
                                <td className="py-2.5 px-3 text-center font-mono text-slate-400">{i + 1}</td>
                                <td className="py-2.5 px-4 font-bold text-slate-900">{it.name}</td>
                                <td className="py-2.5 px-3 font-mono">{it.unit}</td>
                                <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-900 bg-blue-50/50">
                                  {it.requestedQuantity} {it.unit}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-slate-600">SAR {(it.unitCost || it.unitPrice || 0).toLocaleString()}</td>
                                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                                  SAR {(it.totalCost || it.totalPrice || 0).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* PO Footer */}
                      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                        <div className="text-[11px] text-slate-500">
                          Total contract committed to vendor <strong className="text-slate-800">{po.vendorName}</strong>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-black text-slate-900 text-sm text-emerald-600">
                            SAR {po.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ==================================================================== */}
            {/* SECTION 3: INBOUND GOODS RECEIPTS (GRN) HISTORY FOR THIS PROJECT    */}
            {/* ==================================================================== */}
            {selectedProjectGrns.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Goods Receipt Notes (GRN) Log — {selectedProjectGrns.length} Received</span>
                </h3>

                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4">GRN Number</th>
                        <th className="py-2.5 px-3">Date Received</th>
                        <th className="py-2.5 px-4">Received By</th>
                        <th className="py-2.5 px-4">Warehouse Location</th>
                        <th className="py-2.5 px-3 text-center">QA/QC Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {selectedProjectGrns.map((grn) => (
                        <tr key={grn.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-2.5 px-4 font-mono font-black text-emerald-800">{grn.grnNumber}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{grn.receivedDate}</td>
                          <td className="py-2.5 px-4 text-slate-900 font-semibold">{grn.receivedBy}</td>
                          <td className="py-2.5 px-4 text-slate-600">{grn.warehouseLocation}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              ✓ Passed QA/QC
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CREATE OFFICIAL PURCHASE ORDER (PO)                           */}
      {/* ==================================================================== */}
      {isCreatePoModalOpen && selectedMrForPo && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Create Official Purchase Order (PO)</h3>
                  <p className="text-[11px] text-slate-400">All shortfall items from requisition will be committed into this Purchase Order</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatePoModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCreatePo} className="p-6 space-y-4 text-xs overflow-y-auto">
              
              {/* Project & Requisition Info Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                        {selectedMrForPo.mrNumber}
                      </span>
                      <span className="font-bold text-slate-900">{selectedMrForPo.projectName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Work Order: <strong className="text-slate-700">{selectedMrForPo.workOrderNo}</strong> • Client: <strong className="text-slate-700">{selectedMrForPo.clientName}</strong>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 flex items-center gap-1 self-start sm:self-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>✓ 100% All Requisitioned Products ({selectedMrForPo.items.length}/{selectedMrForPo.items.length}) Included</span>
                  </span>
                </div>
              </div>

              {/* Items to Purchase Table - Ensuring NO products are missed! */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-bold text-xs flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-cyan-600" />
                    <span>Requisitioned Products Included in this PO ({selectedMrForPo.items.length} Products):</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Total Value: <strong className="text-emerald-700 font-bold">SAR {selectedMrForPo.totalEstimatedCost.toLocaleString()}</strong>
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 text-center">#</th>
                        <th className="py-2.5 px-3">Product SKU & Name</th>
                        <th className="py-2.5 px-2 text-center">Unit</th>
                        <th className="py-2.5 px-3 text-center bg-blue-50 text-blue-900 font-black">PO Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Rate (SAR)</th>
                        <th className="py-2.5 px-4 text-right">Line Total (SAR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
                      {selectedMrForPo.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-[10px] text-cyan-700 font-bold block">{item.itemCode}</span>
                            <span className="font-bold text-slate-900 text-xs block">{item.name}</span>
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono text-slate-600">{item.unit}</td>
                          <td className="py-2.5 px-3 text-center bg-blue-50/50">
                            <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-600 text-white">
                              {item.requestedQuantity} {item.unit}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                            SAR {item.unitCost.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                            SAR {item.totalCost.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Vendor / Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  value={formVendorName}
                  onChange={(e) => setFormVendorName(e.target.value)}
                  placeholder="e.g. Arabian Pipe Company (APC)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Expected Delivery Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDeliveryDate}
                    onChange={(e) => setFormDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-800 text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={formPaymentTerms}
                    onChange={(e) => setFormPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium text-xs focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
                  >
                    <option value="Net 30 Days after GRN Delivery">Net 30 Days after GRN</option>
                    <option value="Net 60 Days after GRN Delivery">Net 60 Days after GRN</option>
                    <option value="Letter of Credit (LC)">Letter of Credit (LC)</option>
                    <option value="Advance Payment 50% / Balance on Delivery">50% Advance / Balance on Delivery</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="text-emerald-900 font-medium">
                  Total PO Contract Value ({selectedMrForPo.items.length} Products):
                </div>
                <div className="font-mono font-black text-emerald-800 text-base">
                  SAR {selectedMrForPo.totalEstimatedCost.toLocaleString()}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatePoModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Issue Official PO for All {selectedMrForPo.items.length} Products</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
