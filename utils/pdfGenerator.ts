import { ProjectRFQ } from '../types/crm';

export function downloadChecklistPDF(project: ProjectRFQ): void {
  if (typeof window === 'undefined') return;

  const req = project.surveyRequest;
  const checklist = req?.checklist || [];
  const compliantCount = checklist.filter(i => i.status === 'Compliant / Verified').length;
  const riskCount = checklist.filter(i => i.status === 'Risk / Hazard Detected').length;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Radwa EPC - Field Survey Checklist: ${project.workOrderNo}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 30px; color: #1e293b; font-size: 13px; line-height: 1.5; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
    .badge { font-size: 11px; padding: 4px 8px; border-radius: 4px; background: #e2e8f0; font-weight: 700; text-transform: uppercase; }
    .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
    .meta-item { font-size: 12px; }
    .meta-label { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 10px; display: block; }
    .meta-val { font-weight: 700; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #0f172a; color: white; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    tr:nth-child(even) { background: #f8fafc; }
    .status-badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
    .status-compliant { background: #dcfce7; color: #15803d; }
    .status-risk { background: #fee2e2; color: #b91c1c; }
    .status-pending { background: #fef3c7; color: #b45309; }
    .observations { margin-top: 25px; padding: 15px; background: #f1f5f9; border-radius: 8px; border-left: 4px solid #0284c7; }
    .signatures { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; margin-top: 50px; padding-top: 20px; border-top: 1px dashed #cbd5e1; }
    .sig-line { border-bottom: 1px solid #0f172a; height: 40px; margin-bottom: 8px; }
    @media print {
      body { margin: 10mm; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">RADWA CONTRACTING CO.</div>
      <div style="font-size: 11px; color: #64748b; font-weight: 600;">FIELD SURVEY DOSSIER & FEASIBILITY INSPECTION CHECKLIST</div>
    </div>
    <div style="text-align: right;">
      <span class="badge">${project.workOrderNo}</span>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Target Date: ${req?.targetSurveyDate || 'Immediate'}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <span class="meta-label">Project Name</span>
      <span class="meta-val">${project.proposedProjectName}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Client & Location</span>
      <span class="meta-val">${project.clientName} (${project.projectLocation})</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Assigned Field Surveyor</span>
      <span class="meta-val">${req?.assignedSurveyorName || 'Operations Field Unit'}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Lead Estimator Contact</span>
      <span class="meta-val">${req?.requestedByEstimatorName || project.assignedEstimatorName || 'Farhan Qureshi'}</span>
    </div>
  </div>

  <h3 style="margin-top: 20px; margin-bottom: 5px; font-size: 14px; color: #0f172a;">
    Verified Checkpoints (${compliantCount} Compliant / ${riskCount} Risks / ${checklist.length} Total)
  </h3>

  <table>
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th style="width: 140px;">Category</th>
        <th>Inspection Point & Ground Verification</th>
        <th style="width: 130px;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${checklist.map((item, idx) => {
        let statusClass = 'status-pending';
        if (item.status === 'Compliant / Verified') statusClass = 'status-compliant';
        if (item.status === 'Risk / Hazard Detected') statusClass = 'status-risk';

        return `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${item.category}</strong></td>
            <td>
              <div>${item.item}</div>
              ${item.findings ? `<div style="font-size: 11px; color: #0369a1; margin-top: 4px;"><strong>Finding:</strong> ${item.findings}</div>` : ''}
            </td>
            <td><span class="status-badge ${statusClass}">${item.status}</span></td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  ${req?.surveyorObservations ? `
    <div class="observations">
      <strong style="color: #0f172a; font-size: 12px; display: block; margin-bottom: 6px;">FIELD SURVEYOR NOTES & OBSERVATIONS:</strong>
      <div style="white-space: pre-line; font-size: 12px; color: #334155;">${req.surveyorObservations}</div>
    </div>
  ` : ''}

  <div class="signatures">
    <div>
      <div class="sig-line"></div>
      <div style="font-weight: 700; font-size: 11px;">${req?.assignedSurveyorName || 'Field Surveyor'}</div>
      <div style="font-size: 10px; color: #64748b;">Ground Inspection Engineer (Sign & Date)</div>
    </div>
    <div>
      <div class="sig-line"></div>
      <div style="font-weight: 700; font-size: 11px;">Eng. Walid Al-Harbi</div>
      <div style="font-size: 10px; color: #64748b;">Operations Site Feasibility Manager (Approval)</div>
    </div>
  </div>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 350);
  }
}
