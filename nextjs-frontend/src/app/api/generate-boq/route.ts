import { NextResponse } from 'next/server';
import type { AiBoqCalculation, BoqLineItem, ManpowerResource, HseResource, QaQcResource, EquipmentResource } from '@/types/crm';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, project, step, apiKey, apiEndpoint, model } = body;

    // 1. Attempt to delegate to Django Backend API for true unified persistence & computation
    try {
      const djangoRes = await fetch(`${BACKEND_URL}/api/generate-boq/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, project, step: step || 1, apiKey, apiEndpoint, model }),
        signal: AbortSignal.timeout(6000)
      });

      if (djangoRes.ok) {
        const djangoData = await djangoRes.json();
        if (djangoData.success && djangoData.data) {
          return NextResponse.json(djangoData);
        }
      }
    } catch {
      // Backend offline or timeout -> proceed to client fallback engine
    }

    // 2. Comprehensive Domain Fallback Generator (Aligned with Saudi contractor standard)
    const pName = project?.proposedProjectName || 'Industrial Infrastructure Project';
    const client = project?.clientName || 'Industrial Client';
    const site = project?.siteName || 'Jubail Industrial City';
    const scopes: string[] = Array.isArray(project?.sowScopes) ? project.sowScopes : ['Civil', 'Mechanical', 'Piping'];
    const desc = (project?.projectWorkDescription || '').toLowerCase();
    const promptLower = (prompt || '').toLowerCase();

    let durationMonths = 12;
    const durationMatch = promptLower.match(/(\d+)\s*month/);
    if (durationMatch) {
      durationMonths = Math.max(3, Math.min(36, parseInt(durationMatch[1])));
    }

    // Dynamic distance & spread detection
    let km = 0;
    const kmMatch = promptLower.match(/(\d+(?:\.\d+)?)\s*(?:kilometer|kilometre|km)\b/);
    if (kmMatch) {
      km = parseFloat(kmMatch[1]);
    } else {
      const lmMatch = promptLower.match(/(\d+(?:\.\d+)?)\s*(?:lm|linear\s*meter|meter|metre|m)\b/);
      if (lmMatch && parseFloat(lmMatch[1]) > 500) {
        km = parseFloat(lmMatch[1]) / 1000.0;
      }
    }

    let spreads = 1.0;
    if (km > 0) {
      if (km <= 15) {
        spreads = 1.0;
      } else if (km <= 50) {
        spreads = 2.0;
      } else if (km <= 150) {
        spreads = Math.min(5.0, Math.max(2.0, km / 30.0));
      } else {
        spreads = Math.min(15.0, Math.max(5.0, km / 70.0));
      }
    }

    let valveCount = 2;
    const valveMatch = promptLower.match(/(\d+)\s*valve/);
    if (valveMatch) {
      valveCount = Math.max(1, parseInt(valveMatch[1]));
    } else if (km > 100) {
      valveCount = Math.max(4, Math.round(km / 35.0));
    }

    const hasCivil = scopes.some(s => ['Civil', 'Site Preparation', 'Structural'].includes(s)) || desc.includes('civil') || desc.includes('concrete') || desc.includes('foundation') || promptLower.includes('trench');
    const hasPiping = scopes.some(s => ['Piping', 'Mechanical'].includes(s)) || desc.includes('pipe') || desc.includes('piping') || promptLower.includes('pipeline') || promptLower.includes('valve');
    const hasElec = scopes.some(s => ['Electrical', 'Instrumentation'].includes(s)) || desc.includes('cable') || desc.includes('electrical') || promptLower.includes('power');
    const hasStruct = scopes.some(s => ['Structural', 'Civil'].includes(s)) || desc.includes('steel') || desc.includes('structure');

    const lineItems: BoqLineItem[] = [];
    let itemIdx = 1;

    if (hasCivil || promptLower.includes('trench')) {
      const sitePrepQty = km > 0 ? Math.round(km * 2500) : 25000;
      lineItems.push({
        id: `boq-${itemIdx}`,
        itemNo: `0${itemIdx}.01`,
        package: 'Site Preparation & Earthworks',
        description: 'Site surveying, grubbing, clearing and mechanical bulk grading per SAES-A-114 specifications',
        unit: 'M2',
        quantity: sitePrepQty,
        unitRate: 36,
        totalAmount: sitePrepQty * 36
      });
      itemIdx++;

      if (promptLower.includes('dewatering') || promptLower.includes('marshy')) {
        const dewaterQty = km > 0 ? Math.round(km * 1000) : 10000;
        lineItems.push({
          id: `boq-${itemIdx}`,
          itemNo: `0${itemIdx}.01`,
          package: 'Civil & Dewatering',
          description: 'Deep trench excavation in saturated/marshy soil with continuous wellpoint dewatering & shoring system',
          unit: 'LM',
          quantity: dewaterQty,
          unitRate: 340,
          totalAmount: dewaterQty * 340
        });
        itemIdx++;
      } else {
        const trenchQty = km > 0 ? Math.round(km * 4200) : 18500;
        lineItems.push({
          id: `boq-${itemIdx}`,
          itemNo: `0${itemIdx}.01`,
          package: 'Civil Works',
          description: 'Bulk trench excavation, rock breaking, leveling and subgrade compaction to 95% MDD',
          unit: 'M3',
          quantity: trenchQty,
          unitRate: 85,
          totalAmount: trenchQty * 85
        });
        itemIdx++;
      }

      const concreteQty = km > 0 ? Math.round(km * 140) : 2400;
      lineItems.push({
        id: `boq-${itemIdx}`,
        itemNo: `0${itemIdx}.01`,
        package: 'Civil Foundations',
        description: 'Cast-in-place reinforced concrete Class C40/50 for equipment foundations & valve pits, including rebar ASTM A615 and formwork',
        unit: 'M3',
        quantity: concreteQty,
        unitRate: 1650,
        totalAmount: concreteQty * 1650
      });
      itemIdx++;
    }

    if (hasPiping) {
      const pipeQty = km > 0 ? Math.round(km * 1000) : 10000;
      const pipeSize = (km >= 50 || promptLower.includes('24-inch') || promptLower.includes('cross-country')) ? '24-inch' : (km >= 10 ? '12-inch' : '8-inch');
      const unitRate = pipeSize === '24-inch' ? 1100 : (pipeSize === '12-inch' ? 680 : 490);
      lineItems.push({
        id: `boq-${itemIdx}`,
        itemNo: `0${itemIdx}.01`,
        package: 'Piping & Mechanical',
        description: `Supply, beveling, fit-up, and field welding of ${pipeSize} CS Seamless Pipe API 5L Gr. X65/B Class 300 with 100% RT NDT`,
        unit: 'LM',
        quantity: pipeQty,
        unitRate: unitRate,
        totalAmount: pipeQty * unitRate
      });
      itemIdx++;

      if (promptLower.includes('valve') || desc.includes('valve') || valveCount > 0) {
        lineItems.push({
          id: `boq-${itemIdx}`,
          itemNo: `0${itemIdx}.01`,
          package: 'Mechanical Piping',
          description: 'Supply, installation & testing of Class 300 Motor Operated Gate Valves (A216 WCB) with bypass & pneumatic actuators',
          unit: 'EA',
          quantity: valveCount,
          unitRate: 65000,
          totalAmount: valveCount * 65000
        });
        itemIdx++;
      }

      if (promptLower.includes('hdpe')) {
        const hdpeQty = km > 0 ? Math.round(km * 600) : 6000;
        lineItems.push({
          id: `boq-${itemIdx}`,
          itemNo: `0${itemIdx}.01`,
          package: 'Piping Protection',
          description: 'Supply and electrofusion installation of high-density polyethylene (HDPE PE100) encasement and corrosion protection sleeve',
          unit: 'LM',
          quantity: hdpeQty,
          unitRate: 185,
          totalAmount: hdpeQty * 185
        });
        itemIdx++;
      }
    }

    if (hasElec) {
      const elecQty = km > 0 ? Math.round(km * 350) : 3500;
      lineItems.push({
        id: `boq-${itemIdx}`,
        itemNo: `0${itemIdx}.01`,
        package: 'Electrical & Power',
        description: 'Supply and trench laying of 13.8kV Medium Voltage Armored Power Cable 3x240mm² Cu/XLPE/SWA/PVC with terminations',
        unit: 'LM',
        quantity: elecQty,
        unitRate: 480,
        totalAmount: elecQty * 480
      });
      itemIdx++;

      const scadaLot = Math.max(1, Math.floor(spreads / 2));
      lineItems.push({
        id: `boq-${itemIdx}`,
        itemNo: `0${itemIdx}.01`,
        package: 'Instrumentation & Control',
        description: 'SCADA / RTU instrumentation cabinet, fiber optic communication link, solar panel backup, and field transmitters',
        unit: 'LOT',
        quantity: scadaLot,
        unitRate: 850000,
        totalAmount: scadaLot * 850000
      });
      itemIdx++;
    }

    if (hasStruct) {
      const steelQty = km > 0 ? Math.round(km * 28) : 280;
      lineItems.push({
        id: `boq-${itemIdx}`,
        itemNo: `0${itemIdx}.01`,
        package: 'Structural Steel',
        description: 'Fabrication, hot-dip galvanizing, and site erection of structural steel framing, pipe racks, and platforms per AISC/SAES-M-001',
        unit: 'TON',
        quantity: steelQty,
        unitRate: 11500,
        totalAmount: steelQty * 11500
      });
      itemIdx++;
    }

    const coatQty = km > 0 ? Math.round(km * 850) : 8500;
    lineItems.push({
      id: `boq-${itemIdx}`,
      itemNo: `0${itemIdx}.01`,
      package: 'Protective Coating & Blasting',
      description: 'Abrasive blast cleaning to ISO 8501-1 Sa 2.5 and multi-coat high build epoxy / polyurethane coating system per APCS-1B',
      unit: 'M2',
      quantity: coatQty,
      unitRate: 125,
      totalAmount: coatQty * 125
    });

    const directMaterialCost = lineItems.reduce((acc, it) => acc + it.totalAmount, 0);

    const shiftMultiplier = (promptLower.includes('24/7') || promptLower.includes('shift')) ? 1.6 : 1.0;
    const weldersCount = hasPiping ? Math.round(12 * shiftMultiplier * spreads) : Math.round(4 * spreads);
    const riggersCount = Math.round(6 * shiftMultiplier * spreads);
    const fittersCount = Math.round(16 * shiftMultiplier * spreads);
    const helpersCount = Math.round(24 * shiftMultiplier * spreads);
    const pipingEngCount = Math.max(2, Math.round(2 * spreads));
    const civilEngCount = Math.max(2, Math.round(2 * spreads));
    const pmCount = Math.max(1, Math.floor(spreads / 3));

    const manpower: ManpowerResource[] = [
      { id: 'mp-1', role: 'Site Construction Project Manager', trade: 'Project Management', count: pmCount, durationMonths, monthlyRate: 28000, totalCost: pmCount * durationMonths * 28000 },
      { id: 'mp-2', role: 'Lead Pipeline / Piping Engineer (Saudi Aramco Approved)', trade: 'Engineering', count: pipingEngCount, durationMonths, monthlyRate: 19000, totalCost: pipingEngCount * durationMonths * 19000 },
      { id: 'mp-3', role: 'Senior Civil & Structural Site Engineer', trade: 'Engineering', count: civilEngCount, durationMonths, monthlyRate: 17500, totalCost: civilEngCount * durationMonths * 17500 },
      { id: 'mp-4', role: 'Certified 6G Pipe Welders (SMAW/GTAW)', trade: 'Mechanical', count: weldersCount, durationMonths: Math.min(durationMonths, 10), monthlyRate: 8500, totalCost: weldersCount * Math.min(durationMonths, 10) * 8500 },
      { id: 'mp-5', role: 'Certified Riggers (Aramco Level II / TUV)', trade: 'Rigging', count: riggersCount, durationMonths: Math.min(durationMonths, 8), monthlyRate: 7200, totalCost: riggersCount * Math.min(durationMonths, 8) * 7200 },
      { id: 'mp-6', role: 'Skilled Pipe Fitters & Fabricators', trade: 'Mechanical', count: fittersCount, durationMonths: Math.min(durationMonths, 10), monthlyRate: 5800, totalCost: fittersCount * Math.min(durationMonths, 10) * 5800 },
      { id: 'mp-7', role: 'Electrical & Instrument Technicians', trade: 'Electrical', count: Math.round(6 * shiftMultiplier * spreads), durationMonths: Math.min(durationMonths, 8), monthlyRate: 8000, totalCost: Math.round(6 * shiftMultiplier * spreads) * Math.min(durationMonths, 8) * 8000 },
      { id: 'mp-8', role: 'Heavy Plant & Crane Operators', trade: 'Plant Ops', count: Math.round(6 * spreads), durationMonths, monthlyRate: 7500, totalCost: Math.round(6 * spreads) * durationMonths * 7500 },
      { id: 'mp-9', role: 'Scaffolders & Civil General Helpers', trade: 'Civil', count: helpersCount, durationMonths, monthlyRate: 3900, totalCost: helpersCount * durationMonths * 3900 }
    ];

    const hseMgrCount = Math.max(1, Math.floor(spreads / 3));
    const safetyOfficersCount = Math.max(2, Math.round(2 * shiftMultiplier * spreads));
    const ambulanceCount = Math.max(1, Math.floor(spreads / 2));
    const gasKitsCount = Math.max(1, Math.round(spreads));

    const hse: HseResource[] = [
      { id: 'hse-1', role: 'Lead HSE Manager (NEBOSH Diploma / Aramco Approved)', count: hseMgrCount, requirements: 'Project Safety Plan, JSA matrix, and client audit management', monthlyCost: 22000, totalCost: hseMgrCount * durationMonths * 22000 },
      { id: 'hse-2', role: 'Site Safety Officers (Shift Rotation Coverage)', count: safetyOfficersCount, requirements: 'Continuous hot work permits, confined space entry & trench collapse prevention', monthlyCost: 12000, totalCost: safetyOfficersCount * durationMonths * 12000 },
      { id: 'hse-3', role: 'Paramedic & On-Site Emergency Trauma Ambulance', count: ambulanceCount, requirements: 'Full medical trauma station, heat stress mitigation & desert electrolyte fleet', monthlyCost: 9500, totalCost: ambulanceCount * durationMonths * 9500 },
      { id: 'hse-4', role: 'Calibrated Gas Detectors, Signage & Fall Arrest Kit', count: gasKitsCount, requirements: 'Multi-gas 4-way wireless monitors, rescue winches, barricading & PPE', monthlyCost: 16000, totalCost: gasKitsCount * durationMonths * 16000 }
    ];

    const qaqcMgrCount = Math.max(1, Math.floor(spreads / 3));
    const inspectorsCount = Math.max(2, Math.round(2 * spreads));
    const ndtTeamsCount = Math.max(1, Math.round(spreads * 0.8));
    const hydroCrewsCount = Math.max(1, Math.round(spreads * 0.5));

    const qaqc: QaQcResource[] = [
      { id: 'qa-1', role: 'QA/QC Manager (ISO 9001 Lead Auditor, Aramco Approved)', count: qaqcMgrCount, testingScope: 'Project Quality Plan (PQP), ITP approvals, non-conformance management', monthlyCost: 24000, totalCost: qaqcMgrCount * durationMonths * 24000 },
      { id: 'qa-2', role: 'Senior Welding & Coating Inspector (CSWIP 3.1 / NACE Level 2)', count: inspectorsCount, testingScope: '100% visual inspection of root & cap passes, WQT logs, DFT profiling', monthlyCost: 16500, totalCost: inspectorsCount * Math.min(durationMonths, 10) * 16500 },
      { id: 'qa-3', role: 'Third-Party NDT Radiography (RT) & Ultrasonic (UT) Team', count: ndtTeamsCount, testingScope: 'Radiographic examination of pipeline girth welds per ASME B31.3 & SAES-W-011', monthlyCost: 28000, totalCost: ndtTeamsCount * Math.min(durationMonths, 10) * 28000 },
      { id: 'qa-4', role: 'Hydrostatic Testing & Field Calibration Crew', count: hydroCrewsCount, testingScope: 'Strength & leak test to 1.5x design pressure, deadweight tester, chart recorders', monthlyCost: 22000, totalCost: hydroCrewsCount * Math.min(durationMonths, 6) * 22000 }
    ];

    const cranesQty = Math.max(2, Math.round(2 * spreads));
    const excavatorsQty = Math.max(4, Math.round(4 * spreads));
    const loadersQty = Math.max(2, Math.round(2 * spreads));
    const generatorsQty = Math.max(4, Math.round(4 * spreads));
    const weldingRigsQty = Math.max(8, Math.round(8 * spreads));
    const hydroSkidsQty = Math.max(1, Math.round(spreads * 0.5));

    const equipmentRentals: EquipmentResource[] = [
      { id: 'eq-1', equipmentName: '100-Ton All-Terrain Hydraulic Mobile Crane (Liebherr)', type: 'Lifting Plant', quantity: cranesQty, durationMonths: Math.min(durationMonths, 8), monthlyRental: 45000, totalCost: cranesQty * Math.min(durationMonths, 8) * 45000 },
      { id: 'eq-2', equipmentName: 'CAT 336D Heavy Hydraulic Excavators with Rock Breaker', type: 'Earthmoving', quantity: excavatorsQty, durationMonths: Math.min(durationMonths, 10), monthlyRental: 22000, totalCost: excavatorsQty * Math.min(durationMonths, 10) * 22000 },
      { id: 'eq-3', equipmentName: 'CAT 966 Wheel Loader (3.5 m³ Rehandling Bucket)', type: 'Earthmoving', quantity: loadersQty, durationMonths: Math.min(durationMonths, 10), monthlyRental: 18000, totalCost: loadersQty * Math.min(durationMonths, 10) * 18000 },
      { id: 'eq-4', equipmentName: '500 kVA Soundproof Diesel Generators & Distribution Panel', type: 'Power Supply', quantity: generatorsQty, durationMonths, monthlyRental: 11000, totalCost: generatorsQty * durationMonths * 11000 },
      { id: 'eq-5', equipmentName: 'Mobile Diesel Welding Generator Rigs (Miller Big Blue)', type: 'Welding Plant', quantity: weldingRigsQty, durationMonths: Math.min(durationMonths, 10), monthlyRental: 6500, totalCost: weldingRigsQty * Math.min(durationMonths, 10) * 6500 },
      { id: 'eq-6', equipmentName: 'High-Pressure Hydrotest Pump Skid (Up to 5000 PSI)', type: 'Testing Rig', quantity: hydroSkidsQty, durationMonths: Math.min(durationMonths, 4), monthlyRental: 24000, totalCost: hydroSkidsQty * Math.min(durationMonths, 4) * 24000 }
    ];

    if (promptLower.includes('dewatering') || promptLower.includes('marshy')) {
      const dewaterQty = Math.max(6, Math.round(6 * spreads));
      equipmentRentals.push({
        id: 'eq-7',
        equipmentName: 'High-Volume 6-inch Diesel Dewatering Pumps with Header Pipes',
        type: 'Dewatering System',
        quantity: dewaterQty,
        durationMonths: Math.min(durationMonths, 6),
        monthlyRental: 8500,
        totalCost: dewaterQty * Math.min(durationMonths, 6) * 8500
      });
    }

    if (promptLower.includes('dewatering') || promptLower.includes('marshy')) {
      equipmentRentals.push({
        id: 'eq-7',
        equipmentName: 'High-Volume 6-inch Diesel Dewatering Pumps with Header Pipes',
        type: 'Dewatering System',
        quantity: 6,
        durationMonths: 6,
        monthlyRental: 8500,
        totalCost: 6 * 6 * 8500
      });
    }

    const manpowerCost = manpower.reduce((acc, m) => acc + m.totalCost, 0);
    const hseCost = hse.reduce((acc, h) => acc + h.totalCost, 0);
    const qaqcCost = qaqc.reduce((acc, q) => acc + q.totalCost, 0);
    const equipmentCost = equipmentRentals.reduce((acc, e) => acc + e.totalCost, 0);

    const directTotal = directMaterialCost + manpowerCost + equipmentCost + hseCost + qaqcCost;
    const preliminariesPct = 8.0;
    const overheadsAndPreliminaries = Math.round(directTotal * (preliminariesPct / 100));
    const subTotal = directTotal + overheadsAndPreliminaries;
    const marginPct = 16.5;
    const marginAmount = Math.round(subTotal * (marginPct / 100));
    const totalCommercialBidPrice = subTotal + marginAmount;

    const calculation: AiBoqCalculation = {
      promptUsed: prompt,
      projectSummary: `${pName} for ${client} at ${site}. Synthesized BOQ schedule and full project resource deployment.`,
      estimatedDurationMonths: durationMonths,
      manpower,
      hse,
      qaqc,
      equipmentRentals,
      boqLineItems: lineItems,
      totals: {
        directMaterialCost,
        manpowerCost,
        equipmentCost,
        hseCost,
        qaqcCost,
        overheadsAndPreliminaries,
        marginPct,
        marginAmount,
        totalCommercialBidPrice
      },
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({ success: true, data: calculation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate BOQ' },
      { status: 500 }
    );
  }
}
