import { 
  MaterialRequest, 
  InventoryItem, 
  PurchaseOrder, 
  GoodsReceiptNote, 
  ProjectMaterialReconciliationItem 
} from '../types/inventory';

export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  {
    "id": "inv-item-01",
    "itemCode": "PIP-CS-12-80",
    "name": "A333 Gr 6 Seamless Low-Temp Carbon Steel Pipe 12\" SCH 80",
    "specification": "Aramco 01-SAMSS-010 / ASME B36.10M",
    "category": "Piping & Flanges",
    "unit": "MTR",
    "currentStock": 120,
    "reservedQuantity": 100,
    "availableStock": 20,
    "minStockAlert": 200,
    "unitCost": 650,
    "warehouseLocation": "Jubail Central Yard - Zone A3",
    "lastRestocked": "2026-10-15",
    "status": "Low Stock",
    "supplierName": "Arabian Pipe Company (APC)"
  },
  {
    "id": "inv-item-02",
    "itemCode": "FLG-WN-12-600",
    "name": "ASTM A105 Weld Neck Flange 12\" Class 600 RTJ",
    "specification": "ASME B16.5 / NACE MR0175",
    "category": "Piping & Flanges",
    "unit": "NOS",
    "currentStock": 48,
    "reservedQuantity": 24,
    "availableStock": 24,
    "minStockAlert": 30,
    "unitCost": 2800,
    "warehouseLocation": "Jubail Central Yard - Zone B1",
    "lastRestocked": "2026-10-18",
    "status": "Low Stock",
    "supplierName": "Zamil Valves & Flanges"
  },
  {
    "id": "inv-item-03",
    "itemCode": "PLT-SS-316L",
    "name": "ASTM A240 Stainless Steel 316L Plate 10mm Thk (2m x 6m)",
    "specification": "SABIC Tank Standard / EN 10028-7",
    "category": "Structural Steel & Rebar",
    "unit": "SHT",
    "currentStock": 0,
    "reservedQuantity": 0,
    "availableStock": 0,
    "minStockAlert": 40,
    "unitCost": 4800,
    "warehouseLocation": "Dammam Yard - Plate Bay 2",
    "lastRestocked": "2026-10-19",
    "status": "Out of Stock",
    "supplierName": "Saudi Iron & Steel Co. (HADEED)"
  },
  {
    "id": "inv-item-04",
    "itemCode": "VAL-BALL-12",
    "name": "API 6D Trunnion Ball Valve 12\" Class 600 Full Bore",
    "specification": "API 6D / Firesafe ISO 10497",
    "category": "Piping & Flanges",
    "unit": "NOS",
    "currentStock": 4,
    "reservedQuantity": 2,
    "availableStock": 2,
    "minStockAlert": 6,
    "unitCost": 55000,
    "warehouseLocation": "Jubail Central Yard - High Value Vault",
    "lastRestocked": "2026-10-17",
    "status": "Low Stock",
    "supplierName": "Flowserve Al-Rushaid Co."
  },
  {
    "id": "inv-item-05",
    "itemCode": "GSK-SPW-12",
    "name": "Spiral Wound Gasket 316L/Graphite Class 600 Inner/Outer Ring",
    "specification": "ASME B16.20",
    "category": "Consumables & Hardware",
    "unit": "NOS",
    "currentStock": 120,
    "reservedQuantity": 48,
    "availableStock": 72,
    "minStockAlert": 50,
    "unitCost": 320,
    "warehouseLocation": "Jubail Central Yard - Bin C-12",
    "lastRestocked": "2026-10-19",
    "status": "In Stock",
    "supplierName": "Eastern Seal Co."
  },
  {
    "id": "inv-item-06",
    "itemCode": "RBR-GR60-25",
    "name": "ASTM A615 Grade 60 Deformed Steel Rebar 25mm (12m)",
    "specification": "SABIC Hadeed Certified / SASO SSA 2/1992",
    "category": "Structural Steel & Rebar",
    "unit": "Tons",
    "currentStock": 35,
    "reservedQuantity": 15,
    "availableStock": 20,
    "minStockAlert": 30,
    "unitCost": 2650,
    "warehouseLocation": "Riyadh Logistics Yard - Steel Yard D",
    "lastRestocked": "2026-10-12",
    "status": "Low Stock",
    "supplierName": "Saudi Iron & Steel Co. (HADEED)"
  },
  {
    "id": "inv-item-07",
    "itemCode": "MAT-X65-024",
    "name": "Reinforced concrete foundation pads & grade beams (C50/60)",
    "specification": "Concrete & Foundations / Aramco 09-SAMSS-097",
    "category": "Civil & Concrete",
    "unit": "m\u00b3",
    "currentStock": 500,
    "reservedQuantity": 0,
    "availableStock": 500,
    "minStockAlert": 100,
    "unitCost": 380,
    "warehouseLocation": "Jubail Ready-Mix Terminal Yard",
    "lastRestocked": "2026-10-19",
    "status": "In Stock",
    "supplierName": "Saudi Readymix Concrete Co."
  },
  {
    "id": "inv-item-08",
    "itemCode": "MAT-PIP-024",
    "name": "Fabrication, blast cleaning & erection structural steel members",
    "specification": "Structural Steel / Aramco 12-SAMSS-007",
    "category": "Structural Steel & Rebar",
    "unit": "Ton",
    "currentStock": 5,
    "reservedQuantity": 0,
    "availableStock": 5,
    "minStockAlert": 5,
    "unitCost": 3400,
    "warehouseLocation": "Dammam Structural Yard - Section B",
    "lastRestocked": "2026-10-17",
    "status": "In Stock",
    "supplierName": "Saudi Iron & Steel Co. (HADEED)"
  },
  {
    "id": "inv-item-09",
    "itemCode": "MAT-CBL-032",
    "name": "Cable containment trays & 13.8kV MV armored cabling grid",
    "specification": "Electro-Mechanical / Aramco 15-SAMSS-502",
    "category": "Electrical & Instrumentation",
    "unit": "Pkg",
    "currentStock": 500,
    "reservedQuantity": 0,
    "availableStock": 500,
    "minStockAlert": 20,
    "unitCost": 150,
    "warehouseLocation": "Yanbu Electrical Depot - Bay 3",
    "lastRestocked": "2026-10-18",
    "status": "In Stock",
    "supplierName": "Schneider Electric / Riyadh Cables"
  },
  {
    "id": "inv-item-10",
    "itemCode": "PPE-HARN-F2",
    "name": "Fall Protection Full Body Safety Harness with Double Lanyard",
    "specification": "ANSI Z359.11 / EN 361 / Aramco CSM 1.5",
    "category": "Safety & PPE",
    "unit": "Sets",
    "currentStock": 45,
    "reservedQuantity": 15,
    "availableStock": 30,
    "minStockAlert": 20,
    "unitCost": 380,
    "warehouseLocation": "Central Storehouse - Safety Cage 1",
    "lastRestocked": "2026-10-16",
    "status": "In Stock",
    "supplierName": "Safety Horizon Co."
  },
  {
    "id": "inv-item-11",
    "itemCode": "EQP-GEN-150",
    "name": "Cummins 150kVA Mobile Diesel Generator Trailer Mounted",
    "specification": "ISO 8528 / Aramco SAES-P-100",
    "category": "Heavy Equipment & Tools",
    "unit": "Units",
    "currentStock": 0,
    "reservedQuantity": 0,
    "availableStock": 0,
    "minStockAlert": 2,
    "unitCost": 15000,
    "warehouseLocation": "Heavy Plant Yard - Bay 5",
    "lastRestocked": "2026-09-28",
    "status": "Out of Stock",
    "supplierName": "Zahid Tractor (CAT KSA)"
  },
  {
    "id": "inv-item-12",
    "itemCode": "CBL-XLPE-4C",
    "name": "0.6/1kV CU/XLPE/SWA/PVC 4-Core 185 sqmm Power Cable",
    "specification": "IEC 60502-1 / Saudi Electricity SEC standard",
    "category": "Electrical & Instrumentation",
    "unit": "Meters",
    "currentStock": 100,
    "reservedQuantity": 20,
    "availableStock": 80,
    "minStockAlert": 50,
    "unitCost": 145,
    "warehouseLocation": "Yanbu Warehouse - Drum Yard B",
    "lastRestocked": "2026-10-14",
    "status": "In Stock",
    "supplierName": "Riyadh Cables Group"
  },
  {
    "id": "inv-item-13",
    "itemCode": "WLD-ROD-7018",
    "name": "E7018 Low Hydrogen Welding Electrodes (5kg box)",
    "specification": "AWS A5.1 / ASME SFA-5.1",
    "category": "Consumables & Hardware",
    "unit": "Boxes",
    "currentStock": 80,
    "reservedQuantity": 10,
    "availableStock": 70,
    "minStockAlert": 30,
    "unitCost": 65,
    "warehouseLocation": "Jubail Central Yard - Welding Store",
    "lastRestocked": "2026-10-11",
    "status": "In Stock",
    "supplierName": "ESAB Middle East"
  },
  {
    "id": "inv-item-14",
    "itemCode": "PNT-EPOXY-PRIM",
    "name": "High Solids Epoxy Anti-Corrosive Primer 20L Pail",
    "specification": "Aramco APCS-1B / SSPC Paint 20",
    "category": "Consumables & Hardware",
    "unit": "Pails",
    "currentStock": 25,
    "reservedQuantity": 5,
    "availableStock": 20,
    "minStockAlert": 10,
    "unitCost": 40,
    "warehouseLocation": "Chemical Store - Flammables Cage",
    "lastRestocked": "2026-10-13",
    "status": "In Stock",
    "supplierName": "Hempel Paints Middle East"
  },
  {
    "id": "inv-item-15",
    "itemCode": "FST-BLT-B7",
    "name": "ASTM A193 Grade B7 Heavy Hex Stud Bolts with 2H Nuts",
    "specification": "ASME B18.2.1 / ASTM A193",
    "category": "Consumables & Hardware",
    "unit": "Sets",
    "currentStock": 150,
    "reservedQuantity": 50,
    "availableStock": 100,
    "minStockAlert": 50,
    "unitCost": 18,
    "warehouseLocation": "Jubail Central Yard - Bin D-08",
    "lastRestocked": "2026-10-09",
    "status": "In Stock",
    "supplierName": "Eastern Seal & Fasteners Co."
  },
  {
    "id": "inv-item-16",
    "itemCode": "GEO-TXT-200",
    "name": "Non-Woven Polypropylene Geotextile Fabric 200 GSM (4m x 100m)",
    "specification": "ASTM D4632 / MOT Standard",
    "category": "Civil & Concrete",
    "unit": "Rolls",
    "currentStock": 12,
    "reservedQuantity": 2,
    "availableStock": 10,
    "minStockAlert": 5,
    "unitCost": 560,
    "warehouseLocation": "Civil Materials Yard - Area C",
    "lastRestocked": "2026-10-07",
    "status": "In Stock",
    "supplierName": "Saudi Geosynthetics Co."
  },
  {
    "id": "inv-item-17",
    "itemCode": "PIP-CS-06-40",
    "name": "ASTM A106 Gr. B Seamless Carbon Steel Pipe 6\" SCH 40",
    "specification": "ASME B36.10M / NACE MR0175",
    "category": "Piping & Flanges",
    "unit": "MTR",
    "currentStock": 280,
    "reservedQuantity": 80,
    "availableStock": 200,
    "minStockAlert": 150,
    "unitCost": 320,
    "warehouseLocation": "Jubail Central Yard - Rack A-14",
    "lastRestocked": "2026-10-18",
    "status": "In Stock",
    "supplierName": "Arabian Pipe Company (APC)"
  },
  {
    "id": "inv-item-18",
    "itemCode": "FLG-WN-06-300",
    "name": "ASTM A105 Weld Neck Flange 6\" Class 300 RF",
    "specification": "ASME B16.5",
    "category": "Piping & Flanges",
    "unit": "NOS",
    "currentStock": 64,
    "reservedQuantity": 20,
    "availableStock": 44,
    "minStockAlert": 40,
    "unitCost": 1450,
    "warehouseLocation": "Jubail Central Yard - Zone B2",
    "lastRestocked": "2026-10-16",
    "status": "In Stock",
    "supplierName": "Zamil Valves & Flanges"
  },
  {
    "id": "inv-item-19",
    "itemCode": "VAL-GATE-16",
    "name": "API 6D Slurry Resilient-Seated Knife Gate Valve 16\" Class 150",
    "specification": "API 6D / MSS SP-81",
    "category": "Piping & Flanges",
    "unit": "NOS",
    "currentStock": 6,
    "reservedQuantity": 2,
    "availableStock": 4,
    "minStockAlert": 5,
    "unitCost": 42000,
    "warehouseLocation": "Dammam Yard - Valve Bay 4",
    "lastRestocked": "2026-10-14",
    "status": "Low Stock",
    "supplierName": "Flowserve Al-Rushaid Co."
  },
  {
    "id": "inv-item-20",
    "itemCode": "VAL-DELUGE-08",
    "name": "Cla-Val 8\" Class 150 Deluge Pre-Action Firewater Control Valve",
    "specification": "UL Listed / FM Approved / SAES-B-017",
    "category": "Piping & Flanges",
    "unit": "NOS",
    "currentStock": 8,
    "reservedQuantity": 2,
    "availableStock": 6,
    "minStockAlert": 4,
    "unitCost": 68000,
    "warehouseLocation": "Jubail Yard - High Value Cage",
    "lastRestocked": "2026-10-17",
    "status": "In Stock",
    "supplierName": "Tyco Fire Protection KSA"
  },
  {
    "id": "inv-item-21",
    "itemCode": "PIP-HDPE-16",
    "name": "PE100 High-Density Polyethylene Slurry Pipe 16\" SDR 9",
    "specification": "ISO 4427 / ASTM D3035",
    "category": "Piping & Flanges",
    "unit": "MTR",
    "currentStock": 420,
    "reservedQuantity": 120,
    "availableStock": 300,
    "minStockAlert": 250,
    "unitCost": 480,
    "warehouseLocation": "Dammam Pipe Yard 3",
    "lastRestocked": "2026-10-19",
    "status": "In Stock",
    "supplierName": "Saudi Plastic Products Co. (SAPPCO)"
  },
  {
    "id": "inv-item-22",
    "itemCode": "RBR-GR60-16",
    "name": "ASTM A615 Grade 60 High-Tensile Steel Rebar 16mm (12m bundle)",
    "specification": "SABIC Hadeed Certified",
    "category": "Structural Steel & Rebar",
    "unit": "Tons",
    "currentStock": 60,
    "reservedQuantity": 20,
    "availableStock": 40,
    "minStockAlert": 35,
    "unitCost": 2750,
    "warehouseLocation": "Riyadh Logistics Yard - Bay E",
    "lastRestocked": "2026-10-16",
    "status": "In Stock",
    "supplierName": "Saudi Iron & Steel Co. (HADEED)"
  },
  {
    "id": "inv-item-23",
    "itemCode": "STR-W12-BEAM",
    "name": "ASTM A992 / A36 Wide Flange Structural Steel Beam W12x50",
    "specification": "AISC 360 / Aramco 12-SAMSS-007",
    "category": "Structural Steel & Rebar",
    "unit": "Tons",
    "currentStock": 45,
    "reservedQuantity": 15,
    "availableStock": 30,
    "minStockAlert": 25,
    "unitCost": 3600,
    "warehouseLocation": "Dammam Structural Yard - Bay 1",
    "lastRestocked": "2026-10-15",
    "status": "In Stock",
    "supplierName": "Saudi Steel Profile Co."
  },
  {
    "id": "inv-item-24",
    "itemCode": "CBL-MV-138KV",
    "name": "13.8kV 3-Core 240 sqmm Copper Armored High-Voltage Substation Cable",
    "specification": "IEC 60502-2 / SEC 11-TMSS-01",
    "category": "Electrical & Instrumentation",
    "unit": "Meters",
    "currentStock": 350,
    "reservedQuantity": 50,
    "availableStock": 300,
    "minStockAlert": 200,
    "unitCost": 380,
    "warehouseLocation": "Yanbu Warehouse - Drum Yard A",
    "lastRestocked": "2026-10-18",
    "status": "In Stock",
    "supplierName": "Riyadh Cables Group"
  },
  {
    "id": "inv-item-25",
    "itemCode": "INS-XMT-PRS",
    "name": "Rosemount 3051S Wireless High-Precision Pressure Transmitter",
    "specification": "HART / Ex d IIC T6 / Aramco 34-SAMSS-611",
    "category": "Electrical & Instrumentation",
    "unit": "Units",
    "currentStock": 12,
    "reservedQuantity": 4,
    "availableStock": 8,
    "minStockAlert": 6,
    "unitCost": 12500,
    "warehouseLocation": "Instrumentation Clean Room - Cabinet 2",
    "lastRestocked": "2026-10-16",
    "status": "In Stock",
    "supplierName": "Emerson KSA"
  },
  {
    "id": "inv-item-26",
    "itemCode": "PMP-SLUR-75",
    "name": "Warman 75kW Heavy Duty Centrifugal Slurry Pump Skid",
    "specification": "High Chrome A05 Wet End / Severe Slurry",
    "category": "Heavy Equipment & Tools",
    "unit": "Units",
    "currentStock": 1,
    "reservedQuantity": 0,
    "availableStock": 1,
    "minStockAlert": 2,
    "unitCost": 185000,
    "warehouseLocation": "Dammam Heavy Equipment Yard - Pad 3",
    "lastRestocked": "2026-10-12",
    "status": "Low Stock",
    "supplierName": "Flowserve Al-Rushaid Co."
  },
  {
    "id": "inv-item-27",
    "itemCode": "EQP-WLD-500",
    "name": "Lincoln Electric Vantage 500 Heavy Multi-Process Diesel Welder Skid",
    "specification": "500 Amp / Perkins Diesel / CSA/CE",
    "category": "Heavy Equipment & Tools",
    "unit": "Units",
    "currentStock": 4,
    "reservedQuantity": 1,
    "availableStock": 3,
    "minStockAlert": 2,
    "unitCost": 45000,
    "warehouseLocation": "Heavy Plant Yard - Bay 2",
    "lastRestocked": "2026-10-10",
    "status": "In Stock",
    "supplierName": "Lincoln Electric Middle East"
  },
  {
    "id": "inv-item-28",
    "itemCode": "GRT-NON-SRK",
    "name": "Sika Grout-214 Ultra High Strength Non-Shrink Precision Cementitious Grout (25kg)",
    "specification": "ASTM C1107 Grade C / Dual Shrinkage Compensated",
    "category": "Civil & Concrete",
    "unit": "Bags",
    "currentStock": 300,
    "reservedQuantity": 60,
    "availableStock": 240,
    "minStockAlert": 100,
    "unitCost": 42,
    "warehouseLocation": "Central Storehouse - Pallet Row 4",
    "lastRestocked": "2026-10-18",
    "status": "In Stock",
    "supplierName": "Sika Saudi Arabia"
  },
  {
    "id": "inv-item-29",
    "itemCode": "PPE-SCBA-04",
    "name": "MSA G1 AirHawk II 30-Minute Self-Contained Breathing Apparatus",
    "specification": "NFPA 1981 / NIOSH 42 CFR / Aramco CSM",
    "category": "Safety & PPE",
    "unit": "Sets",
    "currentStock": 8,
    "reservedQuantity": 2,
    "availableStock": 6,
    "minStockAlert": 4,
    "unitCost": 6500,
    "warehouseLocation": "Safety Storehouse - Locker 8",
    "lastRestocked": "2026-10-17",
    "status": "In Stock",
    "supplierName": "MSA Middle East"
  },
  {
    "id": "inv-item-30",
    "itemCode": "COAT-TANK-EP",
    "name": "APCS-1B High Build Solventless Epoxy Internal Tank Lining Coating 20L",
    "specification": "Aramco APCS-1B / Chemical Resistant",
    "category": "Consumables & Hardware",
    "unit": "Pails",
    "currentStock": 80,
    "reservedQuantity": 20,
    "availableStock": 60,
    "minStockAlert": 30,
    "unitCost": 220,
    "warehouseLocation": "Chemical Store - Flammables Cage",
    "lastRestocked": "2026-10-15",
    "status": "In Stock",
    "supplierName": "Jotun Paints KSA"
  }
];

export const INITIAL_MATERIAL_REQUESTS: MaterialRequest[] = [
  {
    "id": "mr-2026-0044",
    "mrNumber": "MR-2026-0044",
    "workOrderNo": "WO-2026-0600",
    "projectId": "WO-2026-0600",
    "projectName": "Jubail EPC Industrial Complex Phase 2 & Site Infrastructure",
    "clientName": "SABIC Petrochemicals / Royal Commission",
    "status": "Pending Verification",
    "priority": "Critical",
    "requestedBy": "Fahad Al-Dossary (Warehouse & Materials)",
    "requestedDate": "2026-10-21",
    "targetDeliveryDate": "2026-11-15",
    "totalEstimatedCost": 6245000,
    "notes": "Technical specifications checked against tender BOQ. Shortfall confirmed unavailable in central yard.",
    "items": [
      {
        "id": "mri-600-1",
        "itemCode": "01.01",
        "name": "Mass excavation in all types of soil including rock breaking and cart away to municipal dumpsite",
        "specification": "Civil Works / Aramco SAES-A-114",
        "category": "Civil & Concrete",
        "requestedQuantity": 38000,
        "quantity": 38000,
        "unit": "m\u00b3",
        "unitCost": 24,
        "totalCost": 912000,
        "preferredVendor": "Aramco Approved Earthworks Contractor",
        "notes": "Shortfall procurement. Required: 38,000 m\u00b3, Allocated from Yard: 0 m\u00b3."
      },
      {
        "id": "mri-600-2",
        "itemCode": "MAT-X65-024",
        "name": "Reinforced concrete foundation pads & grade beams using Sulfate Resistant Cement (C50/60)",
        "specification": "Concrete & Foundations / Aramco 09-SAMSS-097",
        "category": "Civil & Concrete",
        "requestedQuantity": 5900,
        "quantity": 5900,
        "unit": "m\u00b3",
        "unitCost": 380,
        "totalCost": 2242000,
        "preferredVendor": "Saudi Readymix Concrete Co.",
        "notes": "Shortfall procurement. Required: 6,400 m\u00b3, Allocated from Yard: 500 m\u00b3."
      },
      {
        "id": "mri-600-3",
        "itemCode": "MAT-PIP-024",
        "name": "Fabrication, blast cleaning (Sa 2.5), epoxy coating and erection of hot rolled structural steel members",
        "specification": "Structural Steel / Aramco 12-SAMSS-007",
        "category": "Structural Steel & Rebar",
        "requestedQuantity": 815,
        "quantity": 815,
        "unit": "Ton",
        "unitCost": 3400,
        "totalCost": 2771000,
        "preferredVendor": "Saudi Iron & Steel Co. (HADEED)",
        "notes": "Shortfall procurement. Required: 820 Ton, Allocated from Yard: 5 Ton."
      },
      {
        "id": "mri-600-4",
        "itemCode": "04.01",
        "name": "Pre-commissioning, integrated systems loop testing, client witness verification and final punchlist clearing",
        "specification": "Testing & Handover / Pre-commissioning",
        "category": "Civil & Concrete",
        "requestedQuantity": 1,
        "quantity": 1,
        "unit": "Lump Sum",
        "unitCost": 320000,
        "totalCost": 320000,
        "preferredVendor": "Specialized Commissioning Services Ltd.",
        "notes": "Shortfall procurement. Required: 1 Lump Sum, Allocated from Yard: 0."
      }
    ]
  },
  {
    "id": "mr-2026-0041",
    "mrNumber": "MR-2026-0041",
    "workOrderNo": "WO-2026-101",
    "projectId": "WO-2026-101",
    "projectName": "Aramco Safaniya Offshore Pipeline Sector 4 Expansion",
    "clientName": "Saudi Aramco",
    "status": "Verified & Sent to Purchase",
    "priority": "Critical",
    "requestedBy": "Farhan Qureshi (Lead Estimator)",
    "requestedDate": "2026-10-18",
    "targetDeliveryDate": "2026-11-05",
    "totalEstimatedCost": 485000,
    "notes": "Technical specifications checked against tender BOQ & SAES standards. Shortfall confirmed unavailable in central yard.",
    "items": [
      {
        "id": "mri-101-1",
        "itemCode": "PIP-CS-12-80",
        "name": "A333 Gr 6 Seamless Low-Temp Carbon Steel Pipe 12\" SCH 80",
        "specification": "Aramco 01-SAMSS-010 / ASME B36.10M",
        "category": "Piping & Flanges",
        "requestedQuantity": 450,
        "quantity": 450,
        "unit": "MTR",
        "unitCost": 650,
        "totalCost": 292500,
        "preferredVendor": "Arabian Pipe Company (APC)",
        "notes": "Required: 470 MTR, Yard stock allocated: 20 MTR."
      },
      {
        "id": "mri-101-2",
        "itemCode": "VAL-BALL-12",
        "name": "API 6D Trunnion Ball Valve 12\" Class 600 Full Bore",
        "specification": "API 6D / Firesafe ISO 10497",
        "category": "Piping & Flanges",
        "requestedQuantity": 2,
        "quantity": 2,
        "unit": "NOS",
        "unitCost": 55000,
        "totalCost": 110000,
        "preferredVendor": "Flowserve Al-Rushaid Co.",
        "notes": "Required: 4 NOS, Yard stock allocated: 2 NOS."
      },
      {
        "id": "mri-101-3",
        "itemCode": "FST-BLT-B7",
        "name": "ASTM A193 Grade B7 Heavy Hex Stud Bolts with 2H Nuts",
        "specification": "ASME B18.2.1 / Flange Bolting Package",
        "category": "Consumables & Hardware",
        "requestedQuantity": 80,
        "quantity": 80,
        "unit": "Sets",
        "unitCost": 18,
        "totalCost": 1440,
        "preferredVendor": "Eastern Seal & Fasteners Co.",
        "notes": "Required: 180 Sets, Yard stock allocated: 100 Sets."
      }
    ]
  },
  {
    "id": "mr-2026-0042",
    "mrNumber": "MR-2026-0042",
    "workOrderNo": "WO-2026-102",
    "projectId": "WO-2026-102",
    "projectName": "Sabic Jubail Chemical Tank Farm Internal Shell Refurbishment",
    "clientName": "SABIC Jubail",
    "status": "PO Issued",
    "priority": "High",
    "requestedBy": "Farhan Qureshi (Lead Estimator)",
    "requestedDate": "2026-10-19",
    "targetDeliveryDate": "2026-11-12",
    "totalEstimatedCost": 264000,
    "notes": "Material requisition validated against SABIC specifications.",
    "items": [
      {
        "id": "mri-102-1",
        "itemCode": "PLT-SS-316L",
        "name": "ASTM A240 Stainless Steel 316L Plate 10mm Thk (2m x 6m)",
        "specification": "SABIC Tank Standard / EN 10028-7",
        "category": "Structural Steel & Rebar",
        "requestedQuantity": 35,
        "quantity": 35,
        "unit": "SHT",
        "unitCost": 4800,
        "totalCost": 168000,
        "preferredVendor": "Saudi Iron & Steel Co. (HADEED)",
        "notes": "Yard stock 0. Full quantity requisitioned."
      },
      {
        "id": "mri-102-2",
        "itemCode": "COAT-TANK-EP",
        "name": "APCS-1B High Build Solventless Epoxy Internal Tank Lining Coating 20L",
        "specification": "Aramco APCS-1B / Chemical Resistant",
        "category": "Consumables & Hardware",
        "requestedQuantity": 60,
        "quantity": 60,
        "unit": "Pails",
        "unitCost": 220,
        "totalCost": 13200,
        "preferredVendor": "Jotun Paints KSA",
        "notes": "Required: 120 Pails, Allocated: 60 Pails."
      }
    ]
  },
  {
    "id": "mr-2026-0043",
    "mrNumber": "MR-2026-0043",
    "workOrderNo": "WO-2026-103",
    "projectId": "WO-2026-103",
    "projectName": "Ma'aden Phosphate Slurry Transmission Line Replacement",
    "clientName": "Ma'aden Mining Co.",
    "status": "Approved for Procurement",
    "priority": "High",
    "requestedBy": "Farhan Qureshi (Lead Estimator)",
    "requestedDate": "2026-10-20",
    "targetDeliveryDate": "2026-11-18",
    "totalEstimatedCost": 412000,
    "notes": "Heavy slurry transport pipeline materials certified for Maaden phosphate mining operations.",
    "items": [
      {
        "id": "mri-103-1",
        "itemCode": "PIP-HDPE-16",
        "name": "PE100 High-Density Polyethylene Slurry Pipe 16\" SDR 9",
        "specification": "ISO 4427 / Heavy Slurry Abrasion Resistant",
        "category": "Piping & Flanges",
        "requestedQuantity": 300,
        "quantity": 300,
        "unit": "MTR",
        "unitCost": 480,
        "totalCost": 144000,
        "preferredVendor": "Saudi Plastic Products Co. (SAPPCO)",
        "notes": "Required: 600 MTR, Yard stock allocated: 300 MTR."
      },
      {
        "id": "mri-103-2",
        "itemCode": "VAL-GATE-16",
        "name": "API 6D Slurry Resilient-Seated Knife Gate Valve 16\" Class 150",
        "specification": "API 6D / Heavy Phosphate Slurry Service",
        "category": "Piping & Flanges",
        "requestedQuantity": 4,
        "quantity": 4,
        "unit": "NOS",
        "unitCost": 42000,
        "totalCost": 168000,
        "preferredVendor": "Flowserve Al-Rushaid Co.",
        "notes": "Required: 8 NOS, Yard stock allocated: 4 NOS."
      }
    ]
  },
  {
    "id": "mr-2026-0045",
    "mrNumber": "MR-2026-0045",
    "workOrderNo": "WO-2026-0139",
    "projectId": "WO-2026-0139",
    "projectName": "380kV Substation Transformer Bays & Firefighting Piping Interconnection",
    "clientName": "Saudi Electricity Company (SEC)",
    "status": "Approved for Procurement",
    "priority": "Critical",
    "requestedBy": "Faisal Rahman (Estimating Engineer)",
    "requestedDate": "2026-10-21",
    "targetDeliveryDate": "2026-11-14",
    "totalEstimatedCost": 383000,
    "notes": "SEC substation emergency firefighting system components.",
    "items": [
      {
        "id": "mri-139-1",
        "itemCode": "CBL-MV-138KV",
        "name": "13.8kV 3-Core 240 sqmm Copper Armored High-Voltage Substation Cable",
        "specification": "SEC 11-TMSS-01 / Substation Feeder Line",
        "category": "Electrical & Instrumentation",
        "requestedQuantity": 650,
        "quantity": 650,
        "unit": "Meters",
        "unitCost": 380,
        "totalCost": 247000,
        "preferredVendor": "Riyadh Cables Group",
        "notes": "Required: 950 MTR, Yard stock allocated: 300 MTR."
      },
      {
        "id": "mri-139-2",
        "itemCode": "PIP-CS-06-40",
        "name": "ASTM A106 Gr. B Hot-Dip Galvanized Firefighting Pipe 6\" SCH 40",
        "specification": "ASTM A53 / SAES-B-017 Fire Protection",
        "category": "Piping & Flanges",
        "requestedQuantity": 180,
        "quantity": 180,
        "unit": "MTR",
        "unitCost": 320,
        "totalCost": 57600,
        "preferredVendor": "Arabian Pipe Company (APC)",
        "notes": "Required: 380 MTR, Yard stock allocated: 200 MTR."
      }
    ]
  },
  {
    "id": "mr-2026-0046",
    "mrNumber": "MR-2026-0046",
    "workOrderNo": "WO-2026-0148",
    "projectId": "WO-2026-0148",
    "projectName": "Phosphate Slurry Pipeline & Pump Station Foundation",
    "clientName": "Saudi Arabian Mining Company (MA'ADEN)",
    "status": "Verified & Sent to Purchase",
    "priority": "High",
    "requestedBy": "Fahad Al-Dossary (Warehouse & Materials)",
    "requestedDate": "2026-10-19",
    "targetDeliveryDate": "2026-11-10",
    "totalEstimatedCost": 198000,
    "notes": "Maaden pump station foundation civil and structural shortfall items.",
    "items": [
      {
        "id": "mri-148-1",
        "itemCode": "RBR-GR60-25",
        "name": "ASTM A615 Grade 60 Deformed Steel Rebar 25mm (12m)",
        "specification": "SABIC Hadeed Certified",
        "category": "Structural Steel & Rebar",
        "requestedQuantity": 25,
        "quantity": 25,
        "unit": "Tons",
        "unitCost": 2650,
        "totalCost": 66250,
        "preferredVendor": "Saudi Iron & Steel Co. (HADEED)",
        "notes": "Required: 45 Tons, Allocated: 20 Tons."
      },
      {
        "id": "mri-148-2",
        "itemCode": "MAT-X65-024",
        "name": "Reinforced concrete foundation pads & grade beams (C50/60)",
        "specification": "Pump Station Deep Foundation / Sulfate Resistant",
        "category": "Civil & Concrete",
        "requestedQuantity": 350,
        "quantity": 350,
        "unit": "m\u00b3",
        "unitCost": 380,
        "totalCost": 133000,
        "preferredVendor": "Saudi Readymix Concrete Co.",
        "notes": "Required: 850 m\u00b3, Yard allocation: 500 m\u00b3."
      }
    ]
  },
  {
    "id": "mr-2026-0047",
    "mrNumber": "MR-2026-0047",
    "workOrderNo": "WO-2026-0841",
    "projectId": "WO-2026-0841",
    "projectName": "Haradh Gas Compression Plant Piping & Manifold Tie-In",
    "clientName": "Saudi Aramco",
    "status": "Approved for Procurement",
    "priority": "Critical",
    "requestedBy": "Farhan Qureshi (Lead Estimator)",
    "requestedDate": "2026-10-21",
    "targetDeliveryDate": "2026-11-16",
    "totalEstimatedCost": 215000,
    "notes": "Aramco Haradh gas manifold piping and valve shortfall packages.",
    "items": [
      {
        "id": "mri-841-1",
        "itemCode": "PIP-CS-06-40",
        "name": "ASTM A106 Gr. B Seamless Carbon Steel Pipe 6\" SCH 40",
        "specification": "ASME B36.10M / Process Gas Expansion",
        "category": "Piping & Flanges",
        "requestedQuantity": 120,
        "quantity": 120,
        "unit": "MTR",
        "unitCost": 320,
        "totalCost": 38400,
        "preferredVendor": "Arabian Pipe Company (APC)",
        "notes": "Required: 320 MTR, Yard stock allocated: 200 MTR."
      },
      {
        "id": "mri-841-2",
        "itemCode": "VAL-BALL-12",
        "name": "API 6D Trunnion Ball Valve 6\" Class 300 Full Bore",
        "specification": "API 6D / Firesafe ISO 10497",
        "category": "Piping & Flanges",
        "requestedQuantity": 4,
        "quantity": 4,
        "unit": "NOS",
        "unitCost": 32000,
        "totalCost": 128000,
        "preferredVendor": "Flowserve Al-Rushaid Co.",
        "notes": "Required: 6 NOS, Yard stock allocated: 2 NOS."
      }
    ]
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    "id": "po-2026-0012",
    "poNumber": "PO-2026-0012",
    "mrRef": "MR-2026-0041",
    "workOrderNo": "WO-2026-0600",
    "projectName": "Jubail EPC Industrial Complex Phase 2 & Site Infrastructure",
    "vendorName": "Arabian Pipe Company (APC)",
    "issueDate": "2026-10-19",
    "promisedDeliveryDate": "2026-11-02",
    "totalAmount": 292500,
    "status": "Sent to Vendor",
    "paymentTerms": "30 Days Net LC",
    "items": [
      {
        "id": "po-item-1",
        "itemCode": "PIP-CS-12-80",
        "name": "A333 Gr 6 Seamless Low-Temp Carbon Steel Pipe 12\" SCH 80",
        "quantity": 450,
        "unit": "MTR",
        "unitPrice": 650,
        "totalPrice": 292500
      }
    ]
  },
  {
    "id": "po-2026-0013",
    "poNumber": "PO-2026-0013",
    "mrRef": "MR-2026-0042",
    "workOrderNo": "WO-2026-0841",
    "projectName": "Haradh Gas Compression Plant Piping & Manifold Tie-In",
    "vendorName": "Saudi Iron & Steel Co. (HADEED)",
    "issueDate": "2026-10-20",
    "promisedDeliveryDate": "2026-11-05",
    "totalAmount": 264000,
    "status": "Sent to Vendor",
    "paymentTerms": "45 Days PDC",
    "items": [
      {
        "id": "po-item-2",
        "itemCode": "PLT-SS-316L",
        "name": "ASTM A240 Stainless Steel 316L Plate 10mm Thk (2m x 6m)",
        "quantity": 35,
        "unit": "SHT",
        "unitPrice": 4800,
        "totalPrice": 168000
      }
    ]
  }
];

export const INITIAL_GOODS_RECEIPTS: GoodsReceiptNote[] = [
  {
    "id": "grn-2026-0008",
    "grnNumber": "GRN-2026-0008",
    "poNumber": "PO-2026-0012",
    "mrNumber": "MR-2026-0041",
    "workOrderNo": "WO-2026-101",
    "projectName": "Aramco Safaniya Offshore Pipeline Sector 4 Expansion",
    "receivedDate": "2026-10-20",
    "receivedBy": "Fahad Al-Dossary (Warehouse Lead)",
    "inspectedBy": "Majed Al-Harbi (QA/QC Inspector)",
    "warehouseLocation": "Jubail Central Yard - Receiving Bay A3",
    "qualityStatus": "Passed QA/QC",
    "notes": "MTC Review passed. Aramco inspection release note attached.",
    "items": [
      {
        "itemCode": "PIP-CS-12-80",
        "name": "A333 Gr 6 Seamless Low-Temp Carbon Steel Pipe 12\" SCH 80",
        "quantityReceived": 450,
        "unit": "MTR",
        "inspectionStatus": "Passed QA/QC"
      }
    ]
  },
  {
    "id": "grn-2026-0009",
    "grnNumber": "GRN-2026-0009",
    "poNumber": "PO-2026-0013",
    "mrNumber": "MR-2026-0042",
    "workOrderNo": "WO-2026-102",
    "projectName": "Sabic Jubail Chemical Tank Farm Internal Shell Refurbishment",
    "receivedDate": "2026-10-21",
    "receivedBy": "Sultan Al-Otaibi (Warehouse Receiver)",
    "inspectedBy": "Tariq Al-Ghamdi (QA/QC Engineer)",
    "warehouseLocation": "Dammam Yard - Plate Bay 2",
    "qualityStatus": "Passed QA/QC",
    "notes": "Positive Material Identification (PMI) verified SS 316L chemical composition.",
    "items": [
      {
        "itemCode": "PLT-SS-316L",
        "name": "ASTM A240 Stainless Steel 316L Plate 10mm Thk (2m x 6m)",
        "quantityReceived": 35,
        "unit": "SHT",
        "inspectionStatus": "Passed QA/QC"
      }
    ]
  },
  {
    "id": "grn-2026-0010",
    "grnNumber": "GRN-2026-0010",
    "poNumber": "PO-2026-0014",
    "mrNumber": "MR-2026-0043",
    "workOrderNo": "WO-2026-103",
    "projectName": "Ma'aden Phosphate Slurry Transmission Line Replacement",
    "receivedDate": "2026-10-22",
    "receivedBy": "Fahad Al-Dossary (Warehouse Lead)",
    "inspectedBy": "Majed Al-Harbi (QA/QC Inspector)",
    "warehouseLocation": "Dammam Pipe Yard 3",
    "qualityStatus": "Passed QA/QC",
    "notes": "Hydrostatic pressure test & dimensional inspection certified.",
    "items": [
      {
        "itemCode": "PIP-HDPE-16",
        "name": "PE100 High-Density Polyethylene Slurry Pipe 16\" SDR 9",
        "quantityReceived": 300,
        "unit": "MTR",
        "inspectionStatus": "Passed QA/QC"
      }
    ]
  },
  {
    "id": "grn-2026-0011",
    "grnNumber": "GRN-2026-0011",
    "poNumber": "PO-2026-0015",
    "mrNumber": "MR-2026-0044",
    "workOrderNo": "WO-2026-0600",
    "projectName": "Jubail EPC Industrial Complex Phase 2 & Site Infrastructure",
    "receivedDate": "2026-10-22",
    "receivedBy": "Fahad Al-Dossary (Warehouse Lead)",
    "inspectedBy": "Ahmed Mansoor (Mechanical QC)",
    "warehouseLocation": "Dammam Structural Yard - Section B",
    "qualityStatus": "Passed QA/QC",
    "notes": "Hadeed hot-rolled structural steel mill test certificates verified.",
    "items": [
      {
        "itemCode": "MAT-PIP-024",
        "name": "Fabrication, blast cleaning (Sa 2.5), epoxy coating structural steel members",
        "quantityReceived": 815,
        "unit": "Ton",
        "inspectionStatus": "Passed QA/QC"
      }
    ]
  },
  {
    "id": "grn-2026-0012",
    "grnNumber": "GRN-2026-0012",
    "poNumber": "PO-2026-0016",
    "mrNumber": "MR-2026-0045",
    "workOrderNo": "WO-2026-0139",
    "projectName": "380kV Substation Transformer Bays & Firefighting Piping Interconnection",
    "receivedDate": "2026-10-22",
    "receivedBy": "Sultan Al-Otaibi (Warehouse Receiver)",
    "inspectedBy": "Bilal Siddiqui (Electrical QC)",
    "warehouseLocation": "Yanbu Warehouse - Drum Yard A",
    "qualityStatus": "Passed QA/QC",
    "notes": "High voltage insulation resistance test passed 100kV testing.",
    "items": [
      {
        "itemCode": "CBL-MV-138KV",
        "name": "13.8kV 3-Core 240 sqmm Copper Armored High-Voltage Substation Cable",
        "quantityReceived": 650,
        "unit": "Meters",
        "inspectionStatus": "Passed QA/QC"
      }
    ]
  },
  {
    "id": "grn-2026-0013",
    "grnNumber": "GRN-2026-0013",
    "poNumber": "PO-2026-0017",
    "mrNumber": "MR-2026-0047",
    "workOrderNo": "WO-2026-0841",
    "projectName": "Haradh Gas Compression Plant Piping & Manifold Tie-In",
    "receivedDate": "2026-10-23",
    "receivedBy": "Fahad Al-Dossary (Warehouse Lead)",
    "inspectedBy": "Majed Al-Harbi (QA/QC Inspector)",
    "warehouseLocation": "Jubail Central Yard - Rack A-14",
    "qualityStatus": "Passed QA/QC",
    "notes": "ASTM A106 Gr B seamless piping wall thickness ultrasound check passed.",
    "items": [
      {
        "itemCode": "PIP-CS-06-40",
        "name": "ASTM A106 Gr. B Seamless Carbon Steel Pipe 6\" SCH 40",
        "quantityReceived": 120,
        "unit": "MTR",
        "inspectionStatus": "Passed QA/QC"
      }
    ]
  }
];

export const DEFAULT_PROJECT_BOQ_PRESETS: Record<string, any[]> = {
  "WO-2026-0600": [
    {
      "itemCode": "01.01",
      "name": "Mass excavation in all types of soil including rock breaking and cart away to municipal dumpsite",
      "specification": "Civil Works / Aramco SAES-A-114",
      "category": "Civil & Concrete",
      "unit": "m\u00b3",
      "requiredQuantity": 38000,
      "unitCost": 24
    },
    {
      "itemCode": "MAT-X65-024",
      "name": "Reinforced concrete foundation pads & grade beams using Sulfate Resistant Cement (C50/60)",
      "specification": "Concrete & Foundations / Aramco 09-SAMSS-097",
      "category": "Civil & Concrete",
      "unit": "m\u00b3",
      "requiredQuantity": 6400,
      "unitCost": 380
    },
    {
      "itemCode": "MAT-PIP-024",
      "name": "Fabrication, blast cleaning (Sa 2.5), epoxy coating and erection of hot rolled structural steel members",
      "specification": "Structural Steel / Aramco 12-SAMSS-007",
      "category": "Structural Steel & Rebar",
      "unit": "Ton",
      "requiredQuantity": 820,
      "unitCost": 3400
    },
    {
      "itemCode": "MAT-CBL-032",
      "name": "Supply and installation of cable containment trays, 13.8kV MV armored cabling and grounding grid",
      "specification": "Electro-Mechanical / Aramco 15-SAMSS-502",
      "category": "Electrical & Instrumentation",
      "unit": "Pkg",
      "requiredQuantity": 1,
      "unitCost": 1050000
    },
    {
      "itemCode": "04.01",
      "name": "Pre-commissioning, integrated systems loop testing, client witness verification and final punchlist clearing",
      "specification": "Testing & Handover / Pre-commissioning",
      "category": "Civil & Concrete",
      "unit": "Lump Sum",
      "requiredQuantity": 1,
      "unitCost": 320000
    }
  ],
  "WO-2026-101": [
    {
      "itemCode": "PIP-CS-12-80",
      "name": "A333 Gr 6 Seamless Low-Temp Carbon Steel Pipe 12\" SCH 80",
      "specification": "Aramco 01-SAMSS-010 / ASME B36.10M",
      "category": "Piping & Flanges",
      "unit": "MTR",
      "requiredQuantity": 470,
      "unitCost": 650
    },
    {
      "itemCode": "FLG-WN-12-600",
      "name": "ASTM A105 Weld Neck Flange 12\" Class 600 RTJ",
      "specification": "ASME B16.5 / NACE MR0175",
      "category": "Piping & Flanges",
      "unit": "NOS",
      "requiredQuantity": 24,
      "unitCost": 2800
    },
    {
      "itemCode": "VAL-BALL-12",
      "name": "API 6D Trunnion Ball Valve 12\" Class 600 Full Bore",
      "specification": "API 6D / Firesafe ISO 10497",
      "category": "Piping & Flanges",
      "unit": "NOS",
      "requiredQuantity": 4,
      "unitCost": 55000
    },
    {
      "itemCode": "GSK-SPW-12",
      "name": "Spiral Wound Gasket 316L/Graphite Class 600 Inner/Outer Ring",
      "specification": "ASME B16.20",
      "category": "Consumables & Hardware",
      "unit": "NOS",
      "requiredQuantity": 48,
      "unitCost": 320
    },
    {
      "itemCode": "FST-BLT-B7",
      "name": "ASTM A193 Grade B7 Heavy Hex Stud Bolts with 2H Nuts",
      "specification": "ASME B18.2.1 / ASTM A193",
      "category": "Consumables & Hardware",
      "unit": "Sets",
      "requiredQuantity": 180,
      "unitCost": 18
    }
  ],
  "WO-2026-102": [
    {
      "itemCode": "PLT-SS-316L",
      "name": "ASTM A240 Stainless Steel 316L Plate 10mm Thk (2m x 6m)",
      "specification": "SABIC Tank Standard / EN 10028-7",
      "category": "Structural Steel & Rebar",
      "unit": "SHT",
      "requiredQuantity": 35,
      "unitCost": 4800
    },
    {
      "itemCode": "COAT-TANK-EP",
      "name": "APCS-1B High Build Solventless Epoxy Internal Tank Lining Coating 20L",
      "specification": "Aramco APCS-1B / Chemical Resistant",
      "category": "Consumables & Hardware",
      "unit": "Pails",
      "requiredQuantity": 120,
      "unitCost": 220
    },
    {
      "itemCode": "STR-W12-BEAM",
      "name": "ASTM A992 / A36 Wide Flange Structural Steel Beam W12x50",
      "specification": "AISC 360 / Roof Support Trusses",
      "category": "Structural Steel & Rebar",
      "unit": "Tons",
      "requiredQuantity": 18,
      "unitCost": 3600
    },
    {
      "itemCode": "PPE-GAS-4WAY",
      "name": "Honeywell BW Ultra 4-Gas Portable Confined Space Gas Detector",
      "specification": "Confined Space Entry Safety Kit",
      "category": "Safety & PPE",
      "unit": "Units",
      "requiredQuantity": 4,
      "unitCost": 3200
    }
  ],
  "WO-2026-103": [
    {
      "itemCode": "PIP-HDPE-16",
      "name": "PE100 High-Density Polyethylene Slurry Pipe 16\" SDR 9",
      "specification": "ISO 4427 / Heavy Slurry Abrasion Resistant",
      "category": "Piping & Flanges",
      "unit": "MTR",
      "requiredQuantity": 600,
      "unitCost": 480
    },
    {
      "itemCode": "VAL-GATE-16",
      "name": "API 6D Slurry Resilient-Seated Knife Gate Valve 16\" Class 150",
      "specification": "API 6D / Heavy Phosphate Slurry Service",
      "category": "Piping & Flanges",
      "unit": "NOS",
      "requiredQuantity": 8,
      "unitCost": 42000
    },
    {
      "itemCode": "PMP-SLUR-75",
      "name": "Warman 75kW Heavy Duty Centrifugal Slurry Pump Skid",
      "specification": "High Chrome A05 Wet End Skid",
      "category": "Heavy Equipment & Tools",
      "unit": "Units",
      "requiredQuantity": 2,
      "unitCost": 185000
    },
    {
      "itemCode": "GEO-TXT-200",
      "name": "Non-Woven Polypropylene Geotextile Fabric 200 GSM (4m x 100m)",
      "specification": "Pipeline Trench Bedding & Stabilization",
      "category": "Civil & Concrete",
      "unit": "Rolls",
      "requiredQuantity": 25,
      "unitCost": 560
    }
  ],
  "WO-2026-0145": [
    {
      "itemCode": "PIP-CS-12-80",
      "name": "A333 Gr 6 Seamless Low-Temp Carbon Steel Pipe 12\" SCH 80",
      "specification": "Aramco 01-SAMSS-010 / ASME B36.10M",
      "category": "Piping & Flanges",
      "unit": "MTR",
      "requiredQuantity": 470,
      "unitCost": 650
    },
    {
      "itemCode": "FLG-WN-12-600",
      "name": "ASTM A105 Weld Neck Flange 12\" Class 600 RTJ",
      "specification": "ASME B16.5 / NACE MR0175",
      "category": "Piping & Flanges",
      "unit": "NOS",
      "requiredQuantity": 36,
      "unitCost": 2800
    },
    {
      "itemCode": "GSK-SPW-12",
      "name": "Spiral Wound Gasket 316L/Graphite Class 600 Inner/Outer Ring",
      "specification": "ASME B16.20",
      "category": "Consumables & Hardware",
      "unit": "NOS",
      "requiredQuantity": 60,
      "unitCost": 320
    },
    {
      "itemCode": "WLD-ROD-7018",
      "name": "E7018 Low Hydrogen Welding Electrodes (5kg box)",
      "specification": "AWS A5.1 / Pipeline Tie-In Welds",
      "category": "Consumables & Hardware",
      "unit": "Boxes",
      "requiredQuantity": 40,
      "unitCost": 65
    }
  ],
  "WO-2026-0148": [
    {
      "itemCode": "MAT-X65-024",
      "name": "Reinforced concrete foundation pads & grade beams (C50/60)",
      "specification": "Pump Station Deep Foundation / Sulfate Resistant",
      "category": "Civil & Concrete",
      "unit": "m\u00b3",
      "requiredQuantity": 850,
      "unitCost": 380
    },
    {
      "itemCode": "RBR-GR60-25",
      "name": "ASTM A615 Grade 60 Deformed Steel Rebar 25mm (12m)",
      "specification": "SABIC Hadeed Certified",
      "category": "Structural Steel & Rebar",
      "unit": "Tons",
      "requiredQuantity": 45,
      "unitCost": 2650
    },
    {
      "itemCode": "BLT-ANC-M36",
      "name": "ASTM F1554 Grade 55 Heavy Anchor Bolts M36 x 900mm with Double Nuts",
      "specification": "Vibration-Resistant Pump Skid Anchors",
      "category": "Civil & Concrete",
      "unit": "Sets",
      "requiredQuantity": 32,
      "unitCost": 140
    },
    {
      "itemCode": "GRT-NON-SRK",
      "name": "Sika Grout-214 Ultra High Strength Non-Shrink Precision Cementitious Grout (25kg)",
      "specification": "Pump Baseplate Precision Bedding Grout",
      "category": "Civil & Concrete",
      "unit": "Bags",
      "requiredQuantity": 150,
      "unitCost": 42
    }
  ],
  "WO-2026-0152": [
    {
      "itemCode": "GEO-TXT-200",
      "name": "Non-Woven Polypropylene Geotextile Fabric 200 GSM (4m x 100m)",
      "specification": "Marine Scour Protection Filter Layer",
      "category": "Civil & Concrete",
      "unit": "Rolls",
      "requiredQuantity": 30,
      "unitCost": 560
    },
    {
      "itemCode": "MAT-X65-024",
      "name": "Precast Concrete Tetrapod Marine Armor Units (C50/60)",
      "specification": "Royal Commission Seawater Canal Wave Armor",
      "category": "Civil & Concrete",
      "unit": "m\u00b3",
      "requiredQuantity": 420,
      "unitCost": 380
    },
    {
      "itemCode": "PNT-EPOXY-PRIM",
      "name": "High Solids Epoxy Anti-Corrosive Marine Primer 20L Pail",
      "specification": "Aramco APCS-1B / Heavy Seawater Submersion",
      "category": "Consumables & Hardware",
      "unit": "Pails",
      "requiredQuantity": 80,
      "unitCost": 40
    }
  ],
  "WO-2026-0139": [
    {
      "itemCode": "VAL-DELUGE-08",
      "name": "Cla-Val 8\" Class 150 Deluge Pre-Action Firewater Control Valve",
      "specification": "UL Listed / FM Approved / Substation Deluge",
      "category": "Piping & Flanges",
      "unit": "NOS",
      "requiredQuantity": 6,
      "unitCost": 68000
    },
    {
      "itemCode": "PIP-CS-06-40",
      "name": "ASTM A106 Gr. B Hot-Dip Galvanized Firefighting Pipe 6\" SCH 40",
      "specification": "ASTM A53 / SAES-B-017 Fire Protection",
      "category": "Piping & Flanges",
      "unit": "MTR",
      "requiredQuantity": 380,
      "unitCost": 320
    },
    {
      "itemCode": "CBL-MV-138KV",
      "name": "13.8kV 3-Core 240 sqmm Copper Armored High-Voltage Substation Cable",
      "specification": "SEC 11-TMSS-01 / Substation Feeder Line",
      "category": "Electrical & Instrumentation",
      "unit": "Meters",
      "requiredQuantity": 950,
      "unitCost": 380
    },
    {
      "itemCode": "CBL-TRY-600",
      "name": "Hot-Dip Galvanized Perforated Cable Tray 600mm x 100mm x 3m",
      "specification": "Heavy Duty Return Flange / NEMA VE 1",
      "category": "Electrical & Instrumentation",
      "unit": "Meters",
      "requiredQuantity": 250,
      "unitCost": 95
    }
  ],
  "WO-2026-0841": [
    {
      "itemCode": "PIP-CS-06-40",
      "name": "ASTM A106 Gr. B Seamless Carbon Steel Pipe 6\" SCH 40",
      "specification": "ASME B36.10M / Process Gas Expansion",
      "category": "Piping & Flanges",
      "unit": "MTR",
      "requiredQuantity": 320,
      "unitCost": 320
    },
    {
      "itemCode": "FLG-WN-06-300",
      "name": "ASTM A105 Weld Neck Flange 6\" Class 300 RF",
      "specification": "ASME B16.5 / NACE MR0175",
      "category": "Piping & Flanges",
      "unit": "NOS",
      "requiredQuantity": 48,
      "unitCost": 1450
    },
    {
      "itemCode": "VAL-BALL-12",
      "name": "API 6D Trunnion Ball Valve 6\" Class 300 Full Bore",
      "specification": "API 6D / Firesafe ISO 10497",
      "category": "Piping & Flanges",
      "unit": "NOS",
      "requiredQuantity": 6,
      "unitCost": 32000
    },
    {
      "itemCode": "FST-BLT-B7",
      "name": "ASTM A193 Grade B7 Heavy Hex Stud Bolts with 2H Nuts",
      "specification": "ASME B18.2.1 / Flange Bolting Package",
      "category": "Consumables & Hardware",
      "unit": "Sets",
      "requiredQuantity": 160,
      "unitCost": 18
    }
  ],
  "pipeline_gas": [
    {
      "itemCode": "PIP-CS-12-80",
      "name": "A333 Gr 6 Seamless Low-Temp Carbon Steel Pipe 12\" SCH 80",
      "specification": "Aramco 01-SAMSS-010 / ASME B36.10M",
      "category": "Piping & Flanges",
      "unit": "MTR",
      "requiredQuantity": 350,
      "unitCost": 650
    },
    {
      "itemCode": "FLG-WN-12-600",
      "name": "ASTM A105 Weld Neck Flange 12\" Class 600 RTJ",
      "specification": "ASME B16.5 / NACE MR0175",
      "category": "Piping & Flanges",
      "unit": "NOS",
      "requiredQuantity": 30,
      "unitCost": 2800
    }
  ],
  "default_standard": [
    {
      "itemCode": "PIP-CS-12-80",
      "name": "A333 Gr 6 Seamless Low-Temp Carbon Steel Pipe 12\" SCH 80",
      "specification": "Aramco 01-SAMSS-010 / ASME B36.10M",
      "category": "Piping & Flanges",
      "unit": "MTR",
      "requiredQuantity": 120,
      "unitCost": 650
    },
    {
      "itemCode": "PLT-SS-316L",
      "name": "ASTM A240 Stainless Steel 316L Plate 10mm Thk (2m x 6m)",
      "specification": "SABIC Tank Standard / EN 10028-7",
      "category": "Structural Steel & Rebar",
      "unit": "SHT",
      "requiredQuantity": 20,
      "unitCost": 4800
    },
    {
      "itemCode": "RBR-GR60-25",
      "name": "ASTM A615 Grade 60 Deformed Steel Rebar 25mm (12m)",
      "specification": "SABIC Hadeed Certified / SASO SSA 2/1992",
      "category": "Structural Steel & Rebar",
      "unit": "Tons",
      "requiredQuantity": 50,
      "unitCost": 2650
    }
  ]
};
