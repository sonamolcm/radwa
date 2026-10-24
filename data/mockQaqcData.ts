import { RfiInspectionItem, NcrItem, PunchListItem } from '../types/qaqc';

export const INITIAL_RFIS: RfiInspectionItem[] = [
  {
    id: 'rfi-01',
    rfiRef: 'RFI-2026-0104',
    rfiNumber: 'RFI-2026-0104',
    projectId: 'proj-01',
    workOrderNo: 'WO-2026-101',
    projectName: 'Aramco Safaniya Offshore Pipeline Sector 4 Expansion',
    clientName: 'Saudi Aramco',
    wbsTask: 'Hydrostatic Pressure Test 12" CS Flowline',
    discipline: 'Piping',
    inspectionDiscipline: 'Piping',
    itpHoldPoint: 'Hold Point (H)',
    itpInspectionPoint: 'Hold Point (H)',
    description: 'Hydrostatic Pressure Test 12" CS Flowline at 1.5x Design Pressure (2,250 psig hold for 4 hours)',
    scheduledDateTime: 'Oct 21, 10:00 AM',
    inspectionDate: '2026-10-21',
    siteLocationGridRef: 'Sector 4 Manifold Valve Station #3',
    location: 'Sector 4 Manifold Valve Station #3',
    radwaInspector: 'Eng. Tariq Al-Otaibi',
    consultantInspector: 'Aramco SAPMT Inspector Fahad',
    inspectorName: 'Eng. Tariq Al-Otaibi',
    qaqcLead: 'Majed Al-Harbi (QA/QC Manager)',
    status: 'Scheduled',
    inspectionResult: 'Pending',
    findingsComments: 'Calibrated digital gauges installed. Test manifold certified.',
    remarks: 'Aramco SAPMT inspector confirmed attendance. Calibrated digital gauges installed.'
  },
  {
    id: 'rfi-02',
    rfiRef: 'RFI-2026-0098',
    rfiNumber: 'RFI-2026-0098',
    projectId: 'proj-02',
    workOrderNo: 'WO-2026-102',
    projectName: 'Sabic Jubail Chemical Tank Farm Internal Shell Refurbishment',
    clientName: 'SABIC Jubail',
    wbsTask: 'DFT & Holiday Spark Test for Novolac Epoxy Lining',
    discipline: 'Painting & Coating',
    inspectionDiscipline: 'Painting & Coating',
    itpHoldPoint: 'Witness Point (W)',
    itpInspectionPoint: 'Witness Point (W)',
    description: 'Dry Film Thickness (DFT) & Holiday Spark Test for Novolac Epoxy Lining (Min 500 microns)',
    scheduledDateTime: 'Oct 18, 02:30 PM',
    inspectionDate: '2026-10-18',
    siteLocationGridRef: 'Tank TK-401 Bottom Chime & Shell Course 1',
    location: 'Tank TK-401 Bottom Chime & Shell Course 1',
    radwaInspector: 'Mansour Al-Dossary',
    consultantInspector: 'Sabic QA Rep Eng. Khalid',
    inspectorName: 'Mansour Al-Dossary',
    qaqcLead: 'Majed Al-Harbi (QA/QC Manager)',
    status: 'CODE 1: APPROVED / Compliant',
    inspectionResult: 'Approved (Code 1)',
    findingsComments: 'Zero holidays detected at 2.5kV pulse test. DFT average 580 microns verified.',
    remarks: 'Zero holidays detected at 2.5kV pulse test. DFT average 580 microns verified.'
  }
];

export const INITIAL_NCRS: NcrItem[] = [
  {
    id: 'ncr-01',
    ncrNumber: 'NCR-2026-015',
    workOrderNo: 'WO-2026-101',
    projectName: 'Aramco Safaniya Offshore Pipeline Sector 4 Expansion',
    issuedTo: 'Mechanical Fabrication Subcontractor',
    description: 'Bevel root face preparation on Joint J-44 exceeded WPS maximum tolerance by 1.2mm.',
    severity: 'Minor',
    status: 'Closed',
    correctiveAction: 'Root re-ground and re-beveled in accordance with WPS-CS-04; magnetic particle inspection (MPI) cleared.',
    dateIssued: '2026-10-14',
    closedDate: '2026-10-16'
  }
];

export const INITIAL_PUNCH_LIST: PunchListItem[] = [
  {
    id: 'punch-01',
    punchNumber: 'PUNCH-2026-0032',
    workOrderNo: 'WO-2026-102',
    projectName: 'Sabic Jubail Chemical Tank Farm Internal Shell Refurbishment',
    location: 'Manway Neck #2 - External Flange',
    itemDescription: 'Missing SS 316 spring washers on 4 bonnet studs; replace with approved vendor pack.',
    category: 'Category A (Pre-Commissioning)',
    status: 'Resolved',
    assignedTo: 'Mechanical Piping Lead',
    dueDate: '2026-10-23'
  }
];
