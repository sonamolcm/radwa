import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)

USER_CREDENTIALS = [
    {
        "role_title": "System Administrator",
        "email": "admin@radwa.sa",
        "password": "radwa123"
    },
    {
        "role_title": "CRM & Tendering Administrator",
        "email": "crm@radwa.sa",
        "password": "radwa123"
    },
    {
        "role_title": "Managing Director",
        "email": "md@radwa.sa",
        "password": "radwa123"
    },
    {
        "role_title": "Lead Piping and EPC Estimator",
        "email": "estimator@radwa.sa",
        "password": "radwa123"
    },
    {
        "role_title": "Head of Operations and Site Feasibility",
        "email": "operations@radwa.sa",
        "password": "radwa123"
    },
    {
        "role_title": "Senior Field Surveyor",
        "email": "surveyor@radwa.sa",
        "password": "radwa123"
    },
    {
        "role_title": "QA/QC Quality Director",
        "email": "qaqc@radwa.sa",
        "password": "radwa123"
    },
    {
        "role_title": "Head of HSE & Safety Compliance",
        "email": "hse@radwa.sa",
        "password": "radwa123"
    },
    {
        "role_title": "HR & Personal Director",
        "email": "hr@radwa.sa",
        "password": "radwa123"
    },
    {
        "role_title": "Head of Procurement & Purchase Desk",
        "email": "purchase@radwa.sa",
        "password": "radwa123"
    },
    {
        "role_title": "Central Warehouse & Inventory Controller",
        "email": "inventory@radwa.sa",
        "password": "radwa123"
    },
    {
        "role_title": "Lead Material Requests & QA Engineer",
        "email": "mr@radwa.sa",
        "password": "radwa123"
    }
]

def build_pdf(filename):
    # Portrait A4: 595 x 842 pt
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    company_style = ParagraphStyle(
        'CompanyTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0F172A")
    )

    doc_subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#475569")
    )

    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.white
    )

    cell_role_style = ParagraphStyle(
        'CellRole',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0F172A")
    )

    cell_mono_style = ParagraphStyle(
        'CellMono',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1E293B")
    )

    cell_pwd_style = ParagraphStyle(
        'CellPwd',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0369A1")
    )

    elements = []

    # Clean Company & Document Title (No dates, no URLs, no session auth notes)
    elements.append(Paragraph("<b>RADWA CONTRACTING & TRADING LTD.</b>", company_style))
    elements.append(Spacer(1, 3))
    elements.append(Paragraph("Enterprise ERP User Credentials", doc_subtitle_style))
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0F172A"), spaceBefore=0, spaceAfter=14))

    # Clean 3-Column Table: Role | Email / Username | Password
    headers = [
        Paragraph("Role", th_style),
        Paragraph("Email / Username", th_style),
        Paragraph("Password", th_style),
    ]

    col_widths = [225, 185, 105]
    table_rows = [headers]

    for u in USER_CREDENTIALS:
        row = [
            Paragraph(f"<b>{u['role_title']}</b>", cell_role_style),
            Paragraph(f"<b>{u['email']}</b>", cell_mono_style),
            Paragraph(f"<b>{u['password']}</b>", cell_pwd_style),
        ]
        table_rows.append(row)

    cred_table = Table(table_rows, colWidths=col_widths)
    
    table_style = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
    ]

    for r in range(1, len(table_rows)):
        bg = colors.HexColor("#FFFFFF") if r % 2 == 1 else colors.HexColor("#F8FAFC")
        table_style.append(('BACKGROUND', (0, r), (-1, r), bg))

    cred_table.setStyle(TableStyle(table_style))
    elements.append(cred_table)

    doc.build(elements)
    print(f"Successfully generated clean credentials PDF: {filename}")

if __name__ == '__main__':
    out_dir = r"c:\Users\SONA\OneDrive\Desktop\Empire\radwa"
    artifact_dir = r"C:\Users\SONA\.gemini\antigravity-ide\brain\cb1bb31b-cafa-4ae7-8688-860095848acd"
    
    target_file = os.path.join(out_dir, "Radwa_ERP_User_Credentials.pdf")
    build_pdf(target_file)
    
    if os.path.exists(artifact_dir):
        artifact_target = os.path.join(artifact_dir, "Radwa_ERP_User_Credentials.pdf")
        build_pdf(artifact_target)
