'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Boxes, 
  Layers, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  ShoppingCart, 
  ArrowRight, 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  FileSpreadsheet, 
  FileText, 
  Check, 
  Sparkles, 
  ChevronDown, 
  ShieldCheck, 
  Package, 
  Truck, 
  Eye, 
  Building2, 
  Printer,
  ShieldAlert,
  FolderOpen,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { ProjectRFQ } from '../../types/crm';
import { 
  InventoryItem, 
  ProjectMaterialReconciliationItem, 
  MaterialRequest, 
  MaterialRequestItem, 
  InventoryCategory, 
  StockStatus, 
  MaterialRequestPriority,
  GoodsReceiptNote,
  consolidateMaterialRequests
} from '../../types/inventory';
import { 
  INITIAL_INVENTORY_ITEMS, 
  INITIAL_MATERIAL_REQUESTS, 
  DEFAULT_PROJECT_BOQ_PRESETS,
  INITIAL_GOODS_RECEIPTS 
} from '../../data/mockInventoryData';

interface InventoryDashboardProps {
  projects?: ProjectRFQ[];
  currentUser: any;
  onNavigateToPurchase?: () => void;
  onNavigateToMaterialRequests?: (projectId?: string) => void;
  onBackToMainMenu?: () => void;
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  projects = [],
  currentUser,
  onNavigateToPurchase,
  onNavigateToMaterialRequests,
  onBackToMainMenu
}) => {
  // Navigation Tabs within Inventory:
  // 1. 'reconciliation' -> Project BOQ & Auto-Inventory Stock Check (The User's core workflow!)
  // 2. 'catalog'        -> Central Warehouse Stock Catalog (All products)
  // 3. 'grn'            -> Goods Receipts (GR / GRN) from Purchase Restocking
  const [activeTab, setActiveTab] = useState<'reconciliation' | 'catalog' | 'grn'>('reconciliation');

  // Shared persistent inventory items
  const [items, setItems] = useState<InventoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('radwa_inventory_items');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length >= INITIAL_INVENTORY_ITEMS.length) {
            return parsed;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_INVENTORY_ITEMS;
  });

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

  // Shared Goods Receipts (GRN)
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

  const saveInventory = (newItems: InventoryItem[]) => {
    setItems(newItems);
    if (typeof window !== 'undefined') {
      localStorage.setItem('radwa_inventory_items', JSON.stringify(newItems));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const saveMaterialRequests = (newReqs: MaterialRequest[]) => {
    const consolidated = consolidateMaterialRequests(newReqs);
    setMaterialRequests(consolidated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('radwa_material_requests', JSON.stringify(consolidated));
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

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync inventory & MR state whenever updated from Purchase or another tab
  useEffect(() => {
    const syncFromStorage = () => {
      if (typeof window !== 'undefined') {
        const storedInv = localStorage.getItem('radwa_inventory_items');
        if (storedInv) {
          try {
            setItems(JSON.parse(storedInv));
          } catch (e) {
            console.error(e);
          }
        }
        const storedMrs = localStorage.getItem('radwa_material_requests');
        if (storedMrs) {
          try {
            setMaterialRequests(consolidateMaterialRequests(JSON.parse(storedMrs)));
          } catch (e) {
            console.error(e);
          }
        }
      }
    };

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('focus', syncFromStorage);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('focus', syncFromStorage);
    };
  }, []);

  // --------------------------------------------------------------------------
  // WORKFLOW: PROJECT BOQ & LIVE INVENTORY RECONCILIATION
  // --------------------------------------------------------------------------
  // User's audio: "Inventory-nte athu open cheyyumpol aadyam project-ukal list cheythu kaanikkanam.
  //  Aa project-ukal list cheythu kaanichathil oro project open cheyyumpozhaanu aa project-inte venda
  //  requirement list cheythittundaavanam, allenkil BOQ export cheyyaano type cheythu add cheyyaano pattendathu!"
  const [reconcilerViewMode, setReconcilerViewMode] = useState<'project_list' | 'project_detail'>('project_list');
  const [projectSearchQuery, setProjectSearchQuery] = useState('');

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'rfq-2026-0145');
  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  const filteredProjectsForReconciler = useMemo(() => {
    return projects.filter(p => {
      const q = projectSearchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        p.workOrderNo.toLowerCase().includes(q) ||
        p.proposedProjectName.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q)
      );
    });
  }, [projects, projectSearchQuery]);

  const [reconciliationItems, setReconciliationItems] = useState<ProjectMaterialReconciliationItem[]>([]);

  // Function to reconcile required project items against warehouse inventory
  const reconcileItemsAgainstInventory = (
    rawItems: {
      itemCode?: string;
      name: string;
      specification?: string;
      category?: any;
      unit: string;
      requiredQuantity: number;
      unitCost?: number;
    }[],
    currentInventory: InventoryItem[]
  ): ProjectMaterialReconciliationItem[] => {
    return rawItems.map((raw, idx) => {
      const matchedInv = currentInventory.find(inv => {
        if (raw.itemCode && inv.itemCode.toLowerCase() === raw.itemCode.toLowerCase()) return true;
        const rawNameWords = raw.name.toLowerCase().split(' ').filter(w => w.length > 3);
        const invNameLower = inv.name.toLowerCase();
        return rawNameWords.some(word => invNameLower.includes(word));
      });

      const availableStock = matchedInv ? matchedInv.availableStock : 0;
      const requiredQty = Number(raw.requiredQuantity) || 1;
      const unitCost = raw.unitCost || (matchedInv ? matchedInv.unitCost : 100);

      // Automated Shortfall Calculation:
      // If 10 required and 5 in stock:
      // allocatedFromStock = 5, shortageQuantity = 5 (TO PURCHASE)
      const allocatedFromStock = Math.min(requiredQty, availableStock);
      const shortageQuantity = Math.max(0, requiredQty - allocatedFromStock);

      let stockStatus: 'in_stock' | 'partial_stock' | 'out_of_stock' = 'out_of_stock';
      if (availableStock >= requiredQty) {
        stockStatus = 'in_stock';
      } else if (availableStock > 0) {
        stockStatus = 'partial_stock';
      } else {
        stockStatus = 'out_of_stock';
      }

      return {
        id: `rec-${Date.now()}-${idx}`,
        itemCode: matchedInv ? matchedInv.itemCode : (raw.itemCode || `MAT-PRJ-${100 + idx}`),
        name: raw.name,
        specification: raw.specification || (matchedInv ? matchedInv.specification : 'Project technical specification'),
        category: (raw.category || (matchedInv ? matchedInv.category : 'Piping & Flanges')) as InventoryCategory,
        unit: raw.unit || (matchedInv ? matchedInv.unit : 'Pcs'),
        requiredQuantity: requiredQty,
        inventoryItemId: matchedInv?.id,
        availableInStock: availableStock,
        stockStatus: stockStatus,
        allocatedFromStock: allocatedFromStock,
        shortageQuantity: shortageQuantity,
        unitCost: unitCost,
        totalShortageCost: shortageQuantity * unitCost,
        source: 'boq_import'
      };
    });
  };

  // Auto-reconcile on project change
  useEffect(() => {
    if (!selectedProject) return;

    if (selectedProject.aiBoqCalculation?.boqLineItems && selectedProject.aiBoqCalculation.boqLineItems.length > 0) {
      const boqRaw = selectedProject.aiBoqCalculation.boqLineItems.map((item: any) => ({
        itemCode: item.itemNo,
        name: item.description,
        specification: item.package,
        category: 'Piping & Flanges' as InventoryCategory,
        unit: item.unit,
        requiredQuantity: item.quantity,
        unitCost: item.unitRate
      }));
      setReconciliationItems(reconcileItemsAgainstInventory(boqRaw, items));
    } else {
      const presetKey = selectedProject.proposedProjectName.toLowerCase().includes('gas') || selectedProject.proposedProjectName.toLowerCase().includes('pipeline')
        ? 'pipeline_gas'
        : (selectedProject.proposedProjectName.toLowerCase().includes('phosphate') ? 'civil_industrial' : 'default_standard');
      
      const preset = DEFAULT_PROJECT_BOQ_PRESETS[presetKey] || DEFAULT_PROJECT_BOQ_PRESETS.default_standard;
      setReconciliationItems(reconcileItemsAgainstInventory(preset, items));
    }
  }, [selectedProjectId, items, selectedProject]);

  // Pull from Project BOQ
  const handleImportFromProjectBoq = () => {
    if (!selectedProject) return;

    if (selectedProject.aiBoqCalculation?.boqLineItems && selectedProject.aiBoqCalculation.boqLineItems.length > 0) {
      const boqRaw = selectedProject.aiBoqCalculation.boqLineItems.map((item: any) => ({
        itemCode: item.itemNo,
        name: item.description,
        specification: item.package,
        category: 'Piping & Flanges' as InventoryCategory,
        unit: item.unit,
        requiredQuantity: item.quantity,
        unitCost: item.unitRate
      }));
      setReconciliationItems(reconcileItemsAgainstInventory(boqRaw, items));
      showToast(`📊 Loaded ${boqRaw.length} line items from Estimator AI BOQ for ${selectedProject.workOrderNo}`);
    } else {
      const preset = DEFAULT_PROJECT_BOQ_PRESETS.pipeline_gas;
      setReconciliationItems(reconcileItemsAgainstInventory(preset, items));
      showToast(`✅ Standard BOQ takeoff package loaded & auto-checked against warehouse inventory!`);
    }
  };

  // Update item quantity
  const handleUpdateItemRequiredQty = (itemId: string, newQty: number) => {
    setReconciliationItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const requiredQty = Math.max(1, newQty);
        const allocated = Math.min(requiredQty, item.availableInStock);
        const shortage = Math.max(0, requiredQty - allocated);
        let status: 'in_stock' | 'partial_stock' | 'out_of_stock' = 'out_of_stock';
        if (item.availableInStock >= requiredQty) status = 'in_stock';
        else if (item.availableInStock > 0) status = 'partial_stock';

        return {
          ...item,
          requiredQuantity: requiredQty,
          allocatedFromStock: allocated,
          shortageQuantity: shortage,
          stockStatus: status,
          totalShortageCost: shortage * item.unitCost
        };
      }
      return item;
    }));
  };

  const handleRemoveReconciliationItem = (itemId: string) => {
    setReconciliationItems(prev => prev.filter(i => i.id !== itemId));
    showToast('Item removed from project requirement table.');
  };

  // Add Custom Item Modal
  const [isAddCustomItemModalOpen, setIsAddCustomItemModalOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState<InventoryCategory>('Piping & Flanges');
  const [customItemUnit, setCustomItemUnit] = useState('Pcs');
  const [customItemQty, setCustomItemQty] = useState<number>(10);
  const [customItemRate, setCustomItemRate] = useState<number>(1500);

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) return;

    const newItemRaw = [{
      name: customItemName.trim(),
      category: customItemCategory,
      unit: customItemUnit,
      requiredQuantity: customItemQty,
      unitCost: customItemRate
    }];

    const reconciled = reconcileItemsAgainstInventory(newItemRaw, items);
    setReconciliationItems(prev => [...prev, ...reconciled]);
    setIsAddCustomItemModalOpen(false);
    setCustomItemName('');
    showToast(`➕ Added "${customItemName}" & checked against inventory stock!`);
  };

  // Shortfall items ONLY (Where shortageQuantity > 0)
  const shortfallItemsToProcure = useMemo(() => {
    return reconciliationItems.filter(item => item.shortageQuantity > 0);
  }, [reconciliationItems]);

  const totalShortageCost = useMemo(() => {
    return shortfallItemsToProcure.reduce((sum, item) => sum + item.totalShortageCost, 0);
  }, [shortfallItemsToProcure]);

  const totalAllocatedItems = useMemo(() => {
    return reconciliationItems.filter(item => item.allocatedFromStock > 0);
  }, [reconciliationItems]);

  // Generate Material Request State (Modal & Inline Table)
  const [isGenerateMrModalOpen, setIsGenerateMrModalOpen] = useState(false);
  const [showGeneratedMrTable, setShowGeneratedMrTable] = useState(false);
  const [isMrDispatched, setIsMrDispatched] = useState(false);
  const [dispatchedMrNumber, setDispatchedMrNumber] = useState<string | null>(null);
  const [mrCustomQuantities, setMrCustomQuantities] = useState<Record<string, number>>({});
  const [mrPriority, setMrPriority] = useState<MaterialRequestPriority>('High');
  const [mrTargetDate, setMrTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [mrNotes, setMrNotes] = useState('');

  // Reset table dispatch state when selected project changes
  useEffect(() => {
    setIsMrDispatched(false);
    setDispatchedMrNumber(null);
    setMrCustomQuantities({});
  }, [selectedProjectId]);

  // Suggested vendor mapping helper
  const getSuggestedVendor = (category: InventoryCategory, name: string) => {
    const n = name.toLowerCase();
    if (n.includes('pipe') || category === 'Piping & Flanges') return 'Arabian Pipe Company (APC)';
    if (n.includes('steel') || n.includes('rebar') || category === 'Structural Steel & Rebar') return 'Saudi Iron & Steel Co. (HADEED)';
    if (n.includes('cable') || n.includes('containment') || category === 'Electrical & Instrumentation') return 'Schneider Electric / Riyadh Cables';
    if (n.includes('concrete') || category === 'Civil & Concrete') return 'Saudi Readymix Concrete Co.';
    if (category === 'Heavy Equipment & Tools') return 'Zahid Tractor (CAT KSA)';
    if (category === 'Safety & PPE') return 'Safety Horizon Co. (Dammam)';
    return 'Aramco Approved Stockist (Eastern Province)';
  };

  // Effective Shortfall Items (reflecting custom overrides if user adjusts in the table)
  const effectiveShortfallItems = useMemo(() => {
    return shortfallItemsToProcure.map(item => {
      const customQty = mrCustomQuantities[item.id];
      const qty = customQty !== undefined ? customQty : item.shortageQuantity;
      const totalCost = qty * item.unitCost;
      return {
        ...item,
        effectiveShortageQuantity: qty,
        effectiveTotalShortageCost: totalCost
      };
    });
  }, [shortfallItemsToProcure, mrCustomQuantities]);

  const effectiveTotalShortageCost = useMemo(() => {
    return effectiveShortfallItems.reduce((sum, item) => sum + item.effectiveTotalShortageCost, 0);
  }, [effectiveShortfallItems]);

  const handleCustomQuantityChange = (itemId: string, newQty: number) => {
    setMrCustomQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, newQty || 1)
    }));
  };

  // Handler: When clicking "Generate Material Request (MR)" button below reconciliation
  const handleGenerateMrTableClick = () => {
    if (shortfallItemsToProcure.length === 0) {
      showToast('⚠️ All materials covered in yard stock. No procurement shortfall needed.');
      return;
    }
    setShowGeneratedMrTable(true);
    setIsMrDispatched(false);
    showToast(`📋 Material Request Table Generated Below! Showing ${shortfallItemsToProcure.length} shortfall items.`);
    setTimeout(() => {
      const el = document.getElementById('generated-material-request-table');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handler: Confirm & Dispatch Material Request directly from the Inline Table to MR Hub!
  const handleDispatchMrFromTable = () => {
    if (!selectedProject) return;
    if (effectiveShortfallItems.length === 0) {
      showToast('⚠️ No shortfall items to dispatch.');
      return;
    }

    // Ensure we do NOT duplicate MRs for the same project.
    // If an MR already exists for this project, update it; otherwise add new.
    const existingIndex = materialRequests.findIndex(
      mr => (mr.workOrderNo && mr.workOrderNo === selectedProject.workOrderNo) || 
            (mr.projectId && mr.projectId === selectedProject.id)
    );

    const existingMr = existingIndex >= 0 ? materialRequests[existingIndex] : null;
    const finalMrNumber = existingMr?.mrNumber || `MR-2026-${String(materialRequests.length + 42).padStart(4, '0')}`;

    const newItems: MaterialRequestItem[] = effectiveShortfallItems.map((item, idx) => ({
      id: `mri-${Date.now()}-${idx}`,
      itemCode: item.itemCode,
      name: item.name,
      specification: item.specification,
      category: item.category,
      unit: item.unit,
      requestedQuantity: item.effectiveShortageQuantity,
      unitCost: item.unitCost,
      totalCost: item.effectiveTotalShortageCost,
      preferredVendor: getSuggestedVendor(item.category, item.name),
      notes: `Shortfall procurement. Required: ${item.requiredQuantity} ${item.unit}, Allocated from Yard: ${item.allocatedFromStock} ${item.unit}.`
    }));

    const consolidatedMr: MaterialRequest = {
      id: existingMr?.id || `mr-${Date.now()}`,
      mrNumber: finalMrNumber,
      workOrderNo: selectedProject.workOrderNo,
      projectId: selectedProject.id,
      projectName: selectedProject.proposedProjectName,
      clientName: selectedProject.clientName,
      requestedDate: existingMr?.requestedDate || new Date().toISOString().slice(0, 10),
      targetDeliveryDate: mrTargetDate,
      requestedBy: currentUser?.name || 'Sultan Al-Otaibi (Warehouse & Materials Engineer)',
      department: 'Central Warehouse & Inventory Control',
      priority: mrPriority,
      status: 'Pending Verification',
      items: newItems,
      totalEstimatedCost: effectiveTotalShortageCost,
      approvalStatus: 'Pending',
      notes: mrNotes || existingMr?.notes || `Auto-generated from Inventory BOQ Reconciliation for ${selectedProject.workOrderNo}.`
    };

    let updatedList: MaterialRequest[];
    if (existingIndex >= 0) {
      updatedList = [...materialRequests];
      updatedList[existingIndex] = consolidatedMr;
    } else {
      updatedList = [consolidatedMr, ...materialRequests];
    }

    saveMaterialRequests(updatedList);
    setIsMrDispatched(true);
    setDispatchedMrNumber(finalMrNumber);
    showToast(`📋 ${finalMrNumber} Dispatched! Successfully sent to Material & Estimating Desk for technical verification.`);
  };

  // Handler: Print / Export MR
  const handlePrintMrTable = () => {
    window.print();
  };

  // Handler: Confirm & Dispatch Material Request from Modal
  const handleConfirmGenerateMr = () => {
    if (!selectedProject) return;
    if (shortfallItemsToProcure.length === 0) {
      alert('All required materials are already 100% available in central inventory stock! No procurement shortfall needed.');
      return;
    }

    handleDispatchMrFromTable();
    setIsGenerateMrModalOpen(false);
  };

  // --------------------------------------------------------------------------
  // WORKFLOW: CENTRAL STOCK CATALOG STATE & FILTERS
  // --------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  const filteredCatalogItems = useMemo(() => {
    return items.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.itemCode.toLowerCase().includes(q) ||
        item.specification.toLowerCase().includes(q) ||
        (item.supplierName && item.supplierName.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
      const matchesLoc = selectedLocation === 'All' || item.warehouseLocation.includes(selectedLocation);

      return matchesSearch && matchesCat && matchesStatus && matchesLoc;
    });
  }, [items, searchQuery, selectedCategory, selectedStatus, selectedLocation]);

  const totalStockValue = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
  }, [items]);

  const lowStockCount = useMemo(() => {
    return items.filter(i => i.status === 'Low Stock' || (i.availableStock <= i.minStockAlert && i.availableStock > 0)).length;
  }, [items]);

  const outOfStockCount = useMemo(() => {
    return items.filter(i => i.status === 'Out of Stock' || i.availableStock === 0).length;
  }, [items]);

  const categories: InventoryCategory[] = [
    'Piping & Flanges',
    'Structural Steel & Rebar',
    'Electrical & Instrumentation',
    'Heavy Equipment & Tools',
    'Civil & Concrete',
    'Safety & PPE',
    'Consumables & Hardware'
  ];

  // Add Product Modal
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [formItemCode, setFormItemCode] = useState(`MAT-GEN-${items.length + 101}`);
  const [formName, setFormName] = useState('');
  const [formSpec, setFormSpec] = useState('');
  const [formCategory, setFormCategory] = useState<InventoryCategory>('Piping & Flanges');
  const [formUnit, setFormUnit] = useState('Pcs');
  const [formStock, setFormStock] = useState<number>(20);
  const [formMinAlert, setFormMinAlert] = useState<number>(5);
  const [formUnitCost, setFormUnitCost] = useState<number>(1200);
  const [formLocation, setFormLocation] = useState('Riyadh Central Yard - Aisle 4');
  const [formSupplier, setFormSupplier] = useState('');

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let initialStatus: StockStatus = 'In Stock';
    if (formStock === 0) initialStatus = 'Out of Stock';
    else if (formStock <= formMinAlert) initialStatus = 'Low Stock';

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      itemCode: formItemCode.trim() || `MAT-PRD-${items.length + 1}`,
      name: formName.trim(),
      specification: formSpec.trim() || 'Standard technical specifications',
      category: formCategory,
      unit: formUnit,
      currentStock: Number(formStock) || 0,
      reservedQuantity: 0,
      availableStock: Number(formStock) || 0,
      minStockAlert: Number(formMinAlert) || 5,
      unitCost: Number(formUnitCost) || 0,
      warehouseLocation: formLocation,
      lastRestocked: new Date().toISOString().slice(0, 10),
      status: initialStatus,
      supplierName: formSupplier.trim() || undefined
    };

    saveInventory([newItem, ...items]);
    setIsAddProductModalOpen(false);
    setFormName('');
    showToast(`📦 Product "${newItem.name}" added to central warehouse catalog!`);
  };

  // Quick Stock Adjustment Modal
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'inbound' | 'outbound'>('inbound');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState('Delivery / Restock (GRN)');

  const handleConfirmStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;

    const qty = Number(adjustQuantity) || 0;
    const updated = items.map(it => {
      if (it.id === adjustingItem.id) {
        let newCurrent = it.currentStock;
        if (adjustType === 'inbound') {
          newCurrent += qty;
        } else {
          newCurrent = Math.max(0, newCurrent - qty);
        }

        const newAvailable = Math.max(0, newCurrent - it.reservedQuantity);
        let newStatus: StockStatus = 'In Stock';
        if (newAvailable === 0) newStatus = 'Out of Stock';
        else if (newAvailable <= it.minStockAlert) newStatus = 'Low Stock';

        return {
          ...it,
          currentStock: newCurrent,
          availableStock: newAvailable,
          status: newStatus,
          lastRestocked: adjustType === 'inbound' ? new Date().toISOString().slice(0, 10) : it.lastRestocked
        };
      }
      return it;
    });

    saveInventory(updated);
    setAdjustingItem(null);
    showToast(`✅ Stock updated for "${adjustingItem.name}". New available: ${
      adjustType === 'inbound' 
        ? adjustingItem.availableStock + qty 
        : Math.max(0, adjustingItem.availableStock - qty)
    } ${adjustingItem.unit}`);
  };

  // Process Goods Receipt (GRN) into Stock
  const handleProcessGrnToStock = (grn: GoodsReceiptNote) => {
    // Increment inventory for each item in GRN
    const updated = items.map(invItem => {
      const matchInGrn = grn.items?.find((g: any) => g.itemCode === invItem.itemCode);
      if (matchInGrn && matchInGrn.inspectionStatus === 'Passed QA/QC') {
        const newCurrent = invItem.currentStock + matchInGrn.quantityReceived;
        const newAvailable = newCurrent - invItem.reservedQuantity;
        return {
          ...invItem,
          currentStock: newCurrent,
          availableStock: newAvailable,
          status: (newAvailable > invItem.minStockAlert ? 'In Stock' : (newAvailable === 0 ? 'Out of Stock' : 'Low Stock')) as StockStatus,
          lastRestocked: new Date().toISOString().slice(0, 10)
        };
      }
      return invItem;
    });

    saveInventory(updated);

    // Update material request status to Fulfilled / Stock Updated
    const updatedMrs = materialRequests.map(mr => {
      if (mr.mrNumber === grn.mrNumber) {
        return { ...mr, status: 'Goods Received in Inventory (GRN)' as const };
      }
      return mr;
    });
    saveMaterialRequests(updatedMrs);

    showToast(`🎉 Processed ${grn.grnNumber}! Materials accepted and warehouse stock incremented.`);
  };

  const getStockStatusBadge = (status?: 'in_stock' | 'partial_stock' | 'out_of_stock' | string) => {
    switch (status) {
       case 'in_stock':
         return 'bg-emerald-50 text-emerald-800 border-emerald-200';
       case 'partial_stock':
         return 'bg-amber-50 text-amber-900 border-amber-300';
       case 'out_of_stock':
         return 'bg-rose-50 text-rose-800 border-rose-200';
       default:
         return 'bg-slate-50 text-slate-700 border-slate-200';
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

      {/* Top Banner & Executive Warehouse KPI Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white p-6 shadow-xl border border-emerald-900/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                Radwa Central Warehouse Logistics & Inventory
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-emerald-300 font-mono">Stage 1: Project BOQ & Stock Reconciler</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Boxes className="w-6 h-6 text-emerald-400" />
              <span>Inventory Management System</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Manages the complete warehouse stock catalog, runs live project BOQ comparisons against available yard inventory, 
              and generates official Material Requests (MR) for any shortfall items needed by procurement.
            </p>
          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={() => setIsAddProductModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Stock Item</span>
            </button>
          </div>
        </div>

        {/* 4 Executive KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Catalog SKUs</span>
            <span className="text-xl font-black text-white mt-0.5 block font-mono">{items.length} Products</span>
            <span className="text-[10px] text-slate-400">Pipes, Steel, Electrical, Equipment</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Asset Valuation</span>
            <span className="text-xl font-black text-emerald-400 mt-0.5 block font-mono">
              SAR {totalStockValue.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-300">Central Yard & Regional Hubs</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-amber-300 text-[10px] uppercase font-bold block flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Low Stock Warnings</span>
            </span>
            <span className="text-xl font-black text-amber-300 mt-0.5 block font-mono">
              {lowStockCount} Items
            </span>
            <span className="text-[10px] text-amber-200/70">At or below reorder threshold</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-rose-300 text-[10px] uppercase font-bold block flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>Depleted Items</span>
            </span>
            <span className="text-xl font-black text-rose-400 mt-0.5 block font-mono">
              {outOfStockCount} Zero Stock
            </span>
            <span className="text-[10px] text-rose-200/70">Requires PO Requisition</span>
          </div>
        </div>
      </div>

      {/* Primary Workflow Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          
          {/* TAB 1: USER'S CORE REQUIREMENT - PROJECT BOQ & STOCK RECONCILER */}
          <button
            type="button"
            onClick={() => setActiveTab('reconciliation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'reconciliation'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>1. Project BOQ & Auto-Inventory Reconciler</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px]">
              {reconciliationItems.length}
            </span>
          </button>

          {/* TAB 2: CENTRAL STOCK CATALOG */}
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Boxes className="w-4 h-4 text-emerald-400" />
            <span>2. Central Warehouse Stock Catalog</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px]">
              {items.length}
            </span>
          </button>

          {/* TAB 3: GOODS RECEIPTS (GR / GRN) */}
          <button
            type="button"
            onClick={() => setActiveTab('grn')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'grn'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Truck className="w-4 h-4 text-amber-400" />
            <span>3. Inbound Goods Receipts (GRN)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px]">
              {goodsReceipts.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Warehouse Yard Sync Active</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: PROJECT BOQ & AUTO-INVENTORY RECONCILIATION                   */}
      {/* (Moved into Inventory Management as explicitly requested by user)   */}
      {/* ==================================================================== */}
      {activeTab === 'reconciliation' && (
        <div>
          {reconcilerViewMode === 'project_list' ? (
            /* PROJECT DIRECTORY LIST/GRID VIEW (LANDING SCREEN AS REQUESTED) */
            <div className="space-y-6">
              {/* Header Ribbon with Stats & Search */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-indigo-900/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-cyan-500/30">
                      PROJECT INVENTORY RECONCILIATION DIRECTORY
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-cyan-300 font-bold">
                      {filteredProjectsForReconciler.length} Projects
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight">
                    Select a Project to Inspect Material Demands & Yard Stock
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl">
                    Choose a project below to inspect BOQ requirements, verify available stock in the central warehouse, and generate a shortfall procurement request.
                  </p>
                </div>

                {/* Quick Search */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={projectSearchQuery}
                    onChange={(e) => setProjectSearchQuery(e.target.value)}
                    placeholder="Search WO#, Project, Client..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
              </div>

              {/* Project Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjectsForReconciler.map((proj) => {
                  const existingMr = materialRequests.find(
                    m => (m.workOrderNo && m.workOrderNo === proj.workOrderNo) || 
                         (m.projectId && m.projectId === proj.id)
                  );

                  return (
                    <div
                      key={proj.id}
                      onClick={() => {
                        setSelectedProjectId(proj.id);
                        setReconcilerViewMode('project_detail');
                        setIsMrDispatched(false);
                        setShowGeneratedMrTable(false);
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

                      {/* Bottom Strip with MR Status & CTA */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          {existingMr?.status === 'Goods Received in Inventory (GRN)' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>100% In-Stock • Restocked</span>
                            </span>
                          ) : existingMr ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                              <span>MR: {existingMr.mrNumber}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Reconciliation Ready</span>
                            </span>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1 text-cyan-600 group-hover:text-cyan-700 font-bold text-xs group-hover:translate-x-1 transition-transform">
                          <span>Open Reconciler</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* PROJECT DETAIL RECONCILER VIEW */
            <div className="space-y-5">
              {/* Back to All Projects Directory Bar */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setReconcilerViewMode('project_list')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-2 cursor-pointer w-fit"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>← Back to All Projects Directory</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Current Project:</span>
                  <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {selectedProject?.workOrderNo}
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate max-w-sm hidden md:inline">
                    {selectedProject?.proposedProjectName}
                  </span>
                </div>
              </div>

              {/* Project Selector & Actions */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 max-w-xl">
              <label className="block text-slate-500 text-xs font-semibold mb-1">
                Select Project / Work Order to Check Inventory Requirements:
              </label>
              <div className="relative">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.workOrderNo}] {p.proposedProjectName} • {p.clientName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleImportFromProjectBoq}
                className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold transition flex items-center gap-1.5 border border-cyan-200 cursor-pointer"
                title="Pull items from Estimator BOQ"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-600" />
                <span>Pull / Export from Project BOQ</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddCustomItemModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 border border-slate-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>+ Add Line Item</span>
              </button>
            </div>
          </div>

          {/* 100% In-Stock Celebration Banner (When All Project Requirements are Restocked in Yard) */}
          {shortfallItemsToProcure.length === 0 && reconciliationItems.length > 0 && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/40 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-inner">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-emerald-300">
                    All Required Materials & Equipment for this Project Are 100% In-Stock!
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Purchased goods have arrived and been restocked in the warehouse yard. Zero shortfalls remain. All required items are available for site execution.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 font-mono">
                  ✓ Ready for Site Mobilization
                </span>
              </div>
            </div>
          )}

          {/* Reconciliation Matrix Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">Project Materials Scope</span>
              <span className="text-lg font-black text-slate-900 block mt-0.5">{reconciliationItems.length} Products</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-xs">
              <span className="text-emerald-700 text-[10px] font-bold uppercase block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Covered in Warehouse Stock</span>
              </span>
              <span className="text-lg font-black text-emerald-800 block mt-0.5 font-mono">
                {totalAllocatedItems.length} In-Stock Items
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 shadow-xs">
              <span className="text-rose-700 text-[10px] font-bold uppercase block flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>Shortfalls Requiring Purchase</span>
              </span>
              <span className="text-lg font-black text-rose-800 block mt-0.5 font-mono">
                {shortfallItemsToProcure.length} Items Short
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xs">
              <span className="text-cyan-300 text-[10px] font-bold uppercase block">Est. Shortfall Procurement Value</span>
              <span className="text-lg font-black text-emerald-400 block mt-0.5 font-mono">
                SAR {totalShortageCost.toLocaleString()}
              </span>
            </div>
          </div>

          {/* MAIN RECONCILIATION TABLE (Exact Pipe 10 Needed, 5 In Stock, 5 Shortfall Matrix!) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-600" />
                  <span>Automated Warehouse Stock Check & Shortfall Reconciliation Matrix</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Compares project required materials against current central warehouse stock. 
                  Shortages are calculated dynamically and dispatched as a Material Request (MR).
                </p>
              </div>

              <div className="text-right text-[11px] text-slate-600 font-mono">
                Target Work Order: <span className="font-bold text-slate-900">{selectedProject?.workOrderNo}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Item Code & Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-2 text-center">Unit</th>
                    <th className="py-3 px-3 text-center bg-blue-50/80 text-blue-900 border-x border-blue-200 font-black">
                      Project Required
                    </th>
                    <th className="py-3 px-3 text-center bg-emerald-50/80 text-emerald-900 border-r border-emerald-200 font-black">
                      In-Stock (Inventory)
                    </th>
                    <th className="py-3 px-3 text-center">Stock Match</th>
                    <th className="py-3 px-3 text-center text-slate-600">Allocated from Yard</th>
                    <th className="py-3 px-3 text-center bg-rose-50 text-rose-900 border-x border-rose-200 font-black">
                      Material Request Qty (To Buy)
                    </th>
                    <th className="py-3 px-3 text-right">Unit Rate (SAR)</th>
                    <th className="py-3 px-4 text-right">Shortfall Cost</th>
                    <th className="py-3 px-2 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {reconciliationItems.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-semibold">No materials loaded yet for this project.</p>
                        <button
                          type="button"
                          onClick={handleImportFromProjectBoq}
                          className="mt-3 px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs"
                        >
                          Pull Standard BOQ Items
                        </button>
                      </td>
                    </tr>
                  ) : (
                    reconciliationItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <div className="font-mono text-[10px] text-cyan-700 font-bold">{item.itemCode}</div>
                          <div className="font-bold text-slate-900 text-xs mt-0.5">{item.name}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">{item.specification}</div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3 px-2 text-center font-mono font-bold text-slate-600">
                          {item.unit}
                        </td>

                        {/* Project Required (Editable) */}
                        <td className="py-3 px-3 text-center bg-blue-50/30 border-x border-blue-100">
                          <input
                            type="number"
                            min="1"
                            value={item.requiredQuantity}
                            onChange={(e) => handleUpdateItemRequiredQty(item.id, Number(e.target.value))}
                            className="w-16 px-2 py-1 text-center font-mono font-bold text-xs rounded border border-blue-300 text-blue-900 bg-white focus:ring-1 focus:ring-blue-500"
                          />
                        </td>

                        {/* In-Stock Quantity */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-xs bg-emerald-50/30 border-r border-emerald-100 text-emerald-800">
                          {item.availableInStock} {item.unit}
                        </td>

                        {/* Stock Match Status Badge */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStockStatusBadge(item.stockStatus)}`}>
                            {item.stockStatus === 'in_stock' && '✓ Fully In Stock'}
                            {item.stockStatus === 'partial_stock' && `⚠️ Partial (${item.availableInStock} in yard)`}
                            {item.stockStatus === 'out_of_stock' && '✕ Out of Stock (0)'}
                          </span>
                        </td>

                        {/* Allocated from Yard */}
                        <td className="py-3 px-3 text-center font-mono text-xs text-slate-600">
                          {item.allocatedFromStock} {item.unit}
                        </td>

                        {/* Shortfall Quantity To Purchase (The User's Key Requirement) */}
                        <td className="py-3 px-3 text-center bg-rose-50/60 border-x border-rose-200">
                          <span className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg ${
                            item.shortageQuantity > 0 
                              ? 'bg-rose-600 text-white shadow-xs' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.shortageQuantity > 0 ? `${item.shortageQuantity} ${item.unit}` : '0 (Covered)'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          SAR {item.unitCost.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {item.shortageQuantity > 0 ? (
                            <span className="text-rose-700">SAR {item.totalShortageCost.toLocaleString()}</span>
                          ) : (
                            <span className="text-emerald-600">Covered in Yard</span>
                          )}
                        </td>

                        <td className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveReconciliationItem(item.id)}
                            className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                            title="Remove line"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Bar: Total & "Generate Material Request" Button */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
              <div className="space-y-1">
                <div className="text-xs text-slate-300 font-medium">
                  Inventory Reconciliation Result for <span className="font-bold text-cyan-400">{selectedProject?.workOrderNo}</span>:
                </div>
                <div className="text-sm">
                  <span className="font-black text-rose-400 font-mono">{shortfallItemsToProcure.length} Items</span> require procurement shortfall{' '}
                  <span className="text-slate-400">•</span> Total Shortfall Budget:{' '}
                  <span className="font-black text-emerald-400 font-mono">SAR {totalShortageCost.toLocaleString()}</span>
                </div>
              </div>

              {/* GENERATE MATERIAL REQUEST BUTTON (Dispatches to MR Dashboard & reveals table below) */}
              {shortfallItemsToProcure.length > 0 ? (
                <button
                  type="button"
                  onClick={handleGenerateMrTableClick}
                  className="px-6 py-3 rounded-2xl font-black text-xs transition flex items-center gap-2.5 shadow-xl cursor-pointer bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white ring-2 ring-cyan-400/30"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span className="text-sm tracking-wide">
                    {showGeneratedMrTable ? 'Material Request Table Active ↓' : 'Generate Material Request (MR)'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-black/30 text-white text-[10px] font-mono">
                    {shortfallItemsToProcure.length} Shortfalls
                  </span>
                  {showGeneratedMrTable ? (
                    <ChevronDown className="w-4 h-4 text-cyan-200 animate-bounce" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-cyan-200" />
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>100% In-Stock • No Procurement Shortfall Needed</span>
                </div>
              )}
            </div>
          </div>

          {/* ==================================================================== */}
          {/* INLINE GENERATED MATERIAL REQUEST (MR) TABLE (REQUESTED BY USER)     */}
          {/* ==================================================================== */}
          {showGeneratedMrTable && (
            <div 
              id="generated-material-request-table" 
              className="rounded-3xl bg-white border-2 border-indigo-300 shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-top-4"
            >
              {/* Official Requisition Header */}
              <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-indigo-900/50">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-cyan-500/30">
                      OFFICIAL MATERIAL REQUISITION (MR)
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="font-mono text-cyan-300 font-bold text-xs">
                      {isMrDispatched ? dispatchedMrNumber : `DRAFT-MR-2026-${String(materialRequests.length + 42).padStart(4, '0')}`}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isMrDispatched 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {isMrDispatched ? '✓ Dispatched to MR Hub' : 'Draft Generated (Ready to Dispatch)'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Project Material Shortfall Requisition Slip</span>
                  </h3>
                  
                  <p className="text-xs text-slate-300">
                    Work Order: <span className="font-bold text-cyan-400 font-mono">{selectedProject?.workOrderNo}</span> • {selectedProject?.proposedProjectName} • Client: <span className="text-slate-100 font-semibold">{selectedProject?.clientName}</span>
                  </p>
                </div>

                {/* Requisition Controls */}
                <div className="flex items-center gap-3 flex-wrap bg-white/5 p-3 rounded-2xl border border-white/10 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Priority
                    </label>
                    <select
                      value={mrPriority}
                      onChange={(e) => setMrPriority(e.target.value as MaterialRequestPriority)}
                      disabled={isMrDispatched}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold text-xs outline-none cursor-pointer"
                    >
                      <option value="Critical">🚨 Critical</option>
                      <option value="High">⚠️ High Priority</option>
                      <option value="Normal">🟢 Normal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Target Delivery Date
                    </label>
                    <input
                      type="date"
                      value={mrTargetDate}
                      onChange={(e) => setMrTargetDate(e.target.value)}
                      disabled={isMrDispatched}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs outline-none cursor-pointer"
                    />
                  </div>

                  <div className="pl-2 border-l border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowGeneratedMrTable(false)}
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Collapse Table"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary Metric Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Requisition Items</span>
                  <span className="text-base font-black text-rose-600 font-mono">
                    {effectiveShortfallItems.length} Materials
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Central Yard Coverage</span>
                  <span className="text-base font-black text-emerald-600 font-mono">
                    SAR {reconciliationItems.reduce((acc, i) => acc + (i.allocatedFromStock * i.unitCost), 0).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Net Shortfall Budget</span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    SAR {effectiveTotalShortageCost.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Requisitioning Officer</span>
                  <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">
                    {currentUser?.name || 'Sultan Al-Otaibi (Warehouse)'}
                  </span>
                </div>
              </div>

              {/* The Core Material Request Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3 text-center">#</th>
                      <th className="py-3 px-4">Item SKU & Technical Specification</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-2 text-center">Unit</th>
                      <th className="py-3 px-3 text-center text-slate-600">Project Demand</th>
                      <th className="py-3 px-3 text-center text-emerald-800 bg-emerald-50/50">Allocated in Yard</th>
                      <th className="py-3 px-3 text-center bg-rose-50 text-rose-900 font-black border-x border-rose-200">
                        Shortfall Required (To Buy)
                      </th>
                      <th className="py-3 px-3 text-right">Est. Unit Rate</th>
                      <th className="py-3 px-4 text-right">Line Total (SAR)</th>
                      <th className="py-3 px-3">Suggested Supplier</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {effectiveShortfallItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                          {idx + 1}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-mono text-[10px] text-cyan-700 font-black tracking-wide">{item.itemCode}</div>
                          <div className="font-bold text-slate-900 text-xs mt-0.5">{item.name}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-sm">{item.specification}</div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3 px-2 text-center font-mono font-bold text-slate-600">
                          {item.unit}
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-slate-600">
                          {item.requiredQuantity} {item.unit}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700 bg-emerald-50/30">
                          {item.allocatedFromStock} {item.unit}
                        </td>

                        {/* Editable Shortfall Quantity */}
                        <td className="py-3 px-3 text-center bg-rose-50/60 border-x border-rose-200">
                          <div className="inline-flex items-center gap-1.5">
                            <input
                              type="number"
                              min="1"
                              disabled={isMrDispatched}
                              value={item.effectiveShortageQuantity}
                              onChange={(e) => handleCustomQuantityChange(item.id, Number(e.target.value))}
                              className="w-20 px-2 py-1 text-center font-mono font-black text-xs rounded-lg border-2 border-rose-300 text-rose-900 bg-white shadow-xs focus:ring-2 focus:ring-rose-500 outline-none"
                            />
                            <span className="font-bold text-[11px] text-rose-800">{item.unit}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          SAR {item.unitCost.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          <span className="text-rose-700 font-black">
                            SAR {item.effectiveTotalShortageCost.toLocaleString()}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-[11px] font-medium text-slate-700 truncate max-w-[160px] block">
                            {getSuggestedVendor(item.category, item.name)}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Shortfall
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Requisition Notes & Action Footer */}
              <div className="p-5 bg-slate-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-t border-slate-800">
                <div className="flex-1 max-w-xl">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Site Delivery Notes & Procurement Justification
                  </label>
                  <input
                    type="text"
                    disabled={isMrDispatched}
                    value={mrNotes}
                    onChange={(e) => setMrNotes(e.target.value)}
                    placeholder="e.g. Critical shortfall materials for site mobilization. Verify MTC certificates upon yard delivery..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handlePrintMrTable}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-bold text-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / Export MR</span>
                  </button>

                  {!isMrDispatched ? (
                    <button
                      type="button"
                      onClick={handleDispatchMrFromTable}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs transition flex items-center gap-2.5 shadow-lg shadow-cyan-900/30 cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-cyan-200" />
                      <span>Dispatch to Material Requests Hub</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Dispatched as {dispatchedMrNumber}</span>
                      </span>
                      <span className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Queued for Engineering Verification (Material Desk Farhan Qureshi)</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: CENTRAL WAREHOUSE STOCK CATALOG                               */}
      {/* ==================================================================== */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          
          {/* Filters */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SKU code, pipe diameter, rebar grade, equipment..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium bg-white outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium bg-white outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>

              <button
                type="button"
                onClick={() => setIsAddProductModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Item</span>
              </button>
            </div>
          </div>

          {/* Catalog Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Item Code</th>
                    <th className="py-3 px-4">Product Name & Specifications</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-2 text-center">Unit</th>
                    <th className="py-3 px-3 text-center bg-emerald-50 text-emerald-900 font-black border-x border-emerald-200">
                      Available Stock
                    </th>
                    <th className="py-3 px-2 text-center text-slate-500">Reserved</th>
                    <th className="py-3 px-3 text-center">Total Stock</th>
                    <th className="py-3 px-3 text-right">Unit Cost</th>
                    <th className="py-3 px-4 text-right">Asset Valuation</th>
                    <th className="py-3 px-4">Storage Bay</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Quick Adjust</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {filteredCatalogItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-700 text-[11px] whitespace-nowrap">
                        {item.itemCode}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal truncate max-w-sm mt-0.5">
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

                      <td className="py-3 px-3 text-center font-mono font-extrabold text-xs bg-emerald-50/40 border-x border-emerald-100 text-emerald-800">
                        {item.availableStock}
                      </td>

                      <td className="py-3 px-2 text-center font-mono text-slate-500">
                        {item.reservedQuantity}
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                        {item.currentStock}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        SAR {item.unitCost.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                        SAR {(item.currentStock * item.unitCost).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        <div>{item.warehouseLocation}</div>
                        <div className="text-[9px] text-slate-400 font-mono">Restocked: {item.lastRestocked}</div>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustingItem(item);
                            setAdjustQuantity(10);
                            setAdjustType('inbound');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <RefreshCw className="w-3 h-3 text-emerald-600" />
                          <span>Adjust</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: GOODS RECEIPTS (GR / GRN) & RESTOCKING LOGS                   */}
      {/* (User's audio: "purchase cheythu kazhinjittu athu nere inventory-kku */}
      {/*  pokum, avide goods receipt GR create cheythu purchase-inu kodukkum")*/}
      {/* ==================================================================== */}
      {activeTab === 'grn' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Inbound Goods Receipts (GRN) & Restock Verification</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Physical goods received at the warehouse from Purchase Orders. Accepting items automatically increments inventory stock.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">GRN #</th>
                    <th className="py-3 px-4">Linked PO & Project</th>
                    <th className="py-3 px-3">Date Received</th>
                    <th className="py-3 px-4">Warehouse Bay</th>
                    <th className="py-3 px-4">Received Items</th>
                    <th className="py-3 px-3 text-center">QC Status</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {goodsReceipts.map((grn) => (
                    <tr key={grn.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-xs">
                        {grn.grnNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{grn.projectName}</div>
                        <div className="font-mono text-[10px] text-slate-400">
                          PO: {grn.poNumber} • MR: {grn.mrNumber}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                        {grn.receivedDate}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 text-[11px]">
                        <div className="font-semibold">{grn.warehouseLocation}</div>
                        <div className="text-[10px] text-slate-400">Receiver: {grn.receivedBy}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {(grn.items || []).map((it: any, idx: number) => (
                          <div key={idx} className="text-xs font-semibold text-slate-900">
                            • {it.quantityReceived} {it.unit} of {it.name}
                          </div>
                        ))}
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ✓ Passed QA/QC
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleProcessGrnToStock(grn)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept & Restock</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: GENERATE MATERIAL REQUEST (MR)                             */}
      {/* (Shows ONLY the shortfall items that need to be purchased!)          */}
      {/* ==================================================================== */}
      {isGenerateMrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
            
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Confirm Material Request (Shortfall Items Only)
                  </h3>
                  <div className="text-xs text-cyan-300 font-medium">
                    Work Order: {selectedProject?.workOrderNo} • {selectedProject?.clientName}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGenerateMrModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200 text-cyan-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Automated Inventory Filter Applied:</strong> The items listed below represent <strong>ONLY the actual shortfalls</strong> that must be procured. Materials already available in Radwa's warehouse ({totalAllocatedItems.length} items) have been reserved and excluded from this requisition slip.
                </div>
              </div>

              {/* Target Date & Priority Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Target Required on Site Date *
                  </label>
                  <input
                    type="date"
                    value={mrTargetDate}
                    onChange={(e) => setMrTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Procurement Urgency / Priority *
                  </label>
                  <select
                    value={mrPriority}
                    onChange={(e) => setMrPriority(e.target.value as MaterialRequestPriority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold"
                  >
                    <option value="Critical">🔴 Critical (Shutdown / Urgent)</option>
                    <option value="High">🟡 High (Project Schedule)</option>
                    <option value="Normal">🟢 Normal (Advance Procurement)</option>
                  </select>
                </div>
              </div>

              {/* Shortfall Items Table (ONLY what needs to be bought) */}
              <div>
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider block mb-2">
                  Material Shortfall Requisition List ({shortfallItemsToProcure.length} items):
                </span>

                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3 text-center">Project Need</th>
                        <th className="py-2.5 px-3 text-center">Yard Stock</th>
                        <th className="py-2.5 px-3 text-center bg-rose-100/70 text-rose-900 font-black">
                          Req. To Buy
                        </th>
                        <th className="py-2.5 px-3 text-right">Est. Unit Cost</th>
                        <th className="py-2.5 px-3 text-right">Total (SAR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {shortfallItemsToProcure.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            <div>{item.name}</div>
                            <div className="font-mono text-[9px] text-slate-400">{item.itemCode}</div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                            {item.requiredQuantity} {item.unit}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-emerald-700 font-semibold">
                            {item.allocatedFromStock} {item.unit}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-black text-rose-700 bg-rose-50/50">
                            {item.shortageQuantity} {item.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                            SAR {item.unitCost.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            SAR {item.totalShortageCost.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Shortfall Requisition</span>
                  <span className="text-xs text-slate-300">Net Estimated Material Cost</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-emerald-400 text-base">
                    SAR {totalShortageCost.toLocaleString()}
                  </span>
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsGenerateMrModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmGenerateMr}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Send to Material Requests Hub</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: ADD CUSTOM LINE ITEM TO RECONCILIATION                      */}
      {/* ==================================================================== */}
      {isAddCustomItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden my-auto">
            
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Add Material Line Item for Inventory Check</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCustomItemModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Product / Material Name & Spec *
                </label>
                <input
                  type="text"
                  required
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  placeholder="e.g. 24-inch Schedule 40 Carbon Steel Pipe"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={customItemCategory}
                    onChange={(e) => setCustomItemCategory(e.target.value as InventoryCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Unit</label>
                  <select
                    value={customItemUnit}
                    onChange={(e) => setCustomItemUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Meters">Meters</option>
                    <option value="Tons">Tons</option>
                    <option value="Sets">Sets</option>
                    <option value="Units">Units</option>
                    <option value="m³">m³</option>
                    <option value="Boxes">Boxes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Project Required Qty *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={customItemQty}
                    onChange={(e) => setCustomItemQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Est. Unit Cost (SAR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customItemRate}
                    onChange={(e) => setCustomItemRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
                >
                  Add & Check Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: ADD NEW PRODUCT TO WAREHOUSE CATALOG                         */}
      {/* ==================================================================== */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden my-auto">
            
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-400" />
                <span>Register New Product in Central Inventory</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddProductModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Item Code / SKU *</label>
                  <input
                    type="text"
                    required
                    value={formItemCode}
                    onChange={(e) => setFormItemCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-cyan-700"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. 24-inch Schedule 40 Carbon Steel Pipe"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Technical Specification</label>
                <input
                  type="text"
                  value={formSpec}
                  onChange={(e) => setFormSpec(e.target.value)}
                  placeholder="e.g. Seamless, API 5L Gr. B, SAES-L-105 compliant"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as InventoryCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Unit of Measure</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Meters">Meters</option>
                    <option value="Tons">Tons</option>
                    <option value="Sets">Sets</option>
                    <option value="Units">Units</option>
                    <option value="m³">m³</option>
                    <option value="Boxes">Boxes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Initial Stock Qty *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Min. Alert Level</label>
                  <input
                    type="number"
                    min="1"
                    value={formMinAlert}
                    onChange={(e) => setFormMinAlert(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Unit Cost (SAR)</label>
                  <input
                    type="number"
                    min="0"
                    value={formUnitCost}
                    onChange={(e) => setFormUnitCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Warehouse Location</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Preferred Supplier</label>
                  <input
                    type="text"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs"
                >
                  Save Product to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: QUICK STOCK ADJUSTMENT                                      */}
      {/* ==================================================================== */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden my-auto">
            
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>Adjust Stock Quantity</span>
              </h3>
              <button
                type="button"
                onClick={() => setAdjustingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmStockAdjustment} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-mono text-[10px] text-cyan-700 font-bold">{adjustingItem.itemCode}</span>
                <div className="font-bold text-slate-900 text-xs mt-0.5">{adjustingItem.name}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Current Stock:{' '}
                  <span className="font-mono font-bold text-slate-900">
                    {adjustingItem.currentStock} {adjustingItem.unit}
                  </span>{' '}
                  (Available: {adjustingItem.availableStock} {adjustingItem.unit})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('inbound')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    adjustType === 'inbound'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Receive Goods (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustType('outbound')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    adjustType === 'outbound'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>Issue / Write-off (-)</span>
                </button>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Quantity ({adjustingItem.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason / Reference Note
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. GRN Delivery Note or Site Dispatch"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-xs"
                >
                  Confirm Stock Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
