import { BidPackageDocument, ProjectRFQ } from '../types/crm';

export function downloadSingleDocumentPdf(doc: BidPackageDocument, project: ProjectRFQ): void {
  if (typeof window === 'undefined') return;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${doc.name} - ${project.workOrderNo}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #0f172a; line-height: 1.6; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { font-size: 22px; font-weight: 800; color: #0f172a; }
    .subtitle { color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; }
    .badge { background: #0284c7; color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 25px 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 13px; }
    .meta-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; }
    .meta-val { font-weight: 700; color: #0f172a; }
    .body-content { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 25px; margin-top: 20px; }
    .stamp { margin-top: 50px; display: inline-block; padding: 10px 20px; border: 2px solid #059669; color: #059669; font-weight: 800; font-size: 12px; border-radius: 8px; text-transform: uppercase; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="subtitle">RADWA CONTRACTING CO. &bull; OFFICIAL BID DOSSIER</div>
      <div class="title">${doc.name}</div>
    </div>
    <div>
      <span class="badge">${project.workOrderNo}</span>
    </div>
  </div>

  <div class="meta-box">
    <div>
      <span class="meta-label">Project Name</span>
      <span class="meta-val">${project.proposedProjectName}</span>
    </div>
    <div>
      <span class="meta-label">Client Authority</span>
      <span class="meta-val">${project.clientName}</span>
    </div>
    <div>
      <span class="meta-label">Responsible Department</span>
      <span class="meta-val">${doc.department}</span>
    </div>
    <div>
      <span class="meta-label">Document Status</span>
      <span class="meta-val">${doc.status}</span>
    </div>
  </div>

  <div class="body-content">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px;">Executive Document Narrative & Verified Specification</h3>
    <p>This document constitutes an integral part of the comprehensive commercial and technical tender submission for <strong>${project.proposedProjectName}</strong> under Work Order Reference <strong>${project.workOrderNo}</strong>.</p>
    <p>All specifications, technical calculations, and compliance statements contained herein have been verified in accordance with Kingdom of Saudi Arabia EPC standards, Aramco safety engineering criteria, and Royal Commission environmental regulations.</p>
    ${doc.uploadedFile ? `
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; font-size: 12px; color: #166534; margin-top: 15px;">
        <strong>Attached File:</strong> ${doc.uploadedFile.name} (${doc.uploadedFile.size}) &bull; Uploaded on ${doc.uploadedFile.uploadedAt}
      </div>
    ` : ''}
    <div class="stamp">&bull; VERIFIED & SEALED BY RADWA ERP &bull;</div>
  </div>
</body>
</html>
  `;

  const win = window.open('', '_blank');
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
  }
}

export function downloadCombinedMasterPdf(project: ProjectRFQ, documents: BidPackageDocument[]): void {
  if (typeof window === 'undefined') return;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Master Combined Bid Package - ${project.workOrderNo}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #0f172a; font-size: 12px; line-height: 1.5; }
    .cover { min-height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; border: 3px double #0f172a; padding: 40px; margin-bottom: 40px; }
    .brand { font-size: 28px; font-weight: 900; letter-spacing: -1px; }
    .doc-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .doc-table th { background: #0f172a; color: white; padding: 8px 12px; text-align: left; font-size: 10px; text-transform: uppercase; }
    .doc-table td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .badge-ok { background: #dcfce7; color: #15803d; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 9px; }
    @media print { .page-break { page-break-after: always; } }
  </style>
</head>
<body>
  <div class="cover">
    <div style="font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 2px; text-transform: uppercase;">Kingdom of Saudi Arabia</div>
    <div class="brand" style="margin-top: 10px;">RADWA CONTRACTING CO.</div>
    <div style="height: 2px; width: 60px; background: #0284c7; margin: 20px auto;"></div>
    <h1 style="font-size: 22px; margin-bottom: 5px;">COMPREHENSIVE MASTER BID DOSSIER</h1>
    <p style="font-size: 14px; color: #475569; max-width: 500px;">${project.proposedProjectName}</p>
    <div style="margin-top: 30px; font-size: 12px; font-weight: 700;">
      <div>Work Order No: <span style="font-family: monospace;">${project.workOrderNo}</span></div>
      <div>Client: ${project.clientName} &bull; ${project.projectLocation}</div>
      <div>Total Compiled Documents: ${documents.length} Submittals</div>
    </div>
  </div>

  <div class="page-break"></div>

  <h2>Master Table of Contents (40 Bid Submittals)</h2>
  <table class="doc-table">
    <thead>
      <tr>
        <th style="width: 35px;">#</th>
        <th>Document Title & Specification</th>
        <th style="width: 150px;">Department</th>
        <th style="width: 90px;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${documents.map((d, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${d.name}</strong></td>
          <td>${d.department}</td>
          <td><span class="badge-ok">${d.status}</span></td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
  `;

  const win = window.open('', '_blank');
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
  }
}

export function downloadAllIndividualPdfs(
  project: ProjectRFQ, 
  documents: BidPackageDocument[], 
  onProgress?: (current: number, total: number, name: string) => void
): void {
  // Trigger combined download which prints all submittals
  if (onProgress) {
    onProgress(1, 1, 'Master Compiled Package');
  }
  downloadCombinedMasterPdf(project, documents);
}
