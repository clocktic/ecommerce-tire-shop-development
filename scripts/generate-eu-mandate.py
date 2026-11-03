# Generates public/docs/eu-representative-mandate.pdf (requires `reportlab`).
# Usage: python scripts/generate-eu-mandate.py
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

OUT = Path(__file__).resolve().parent.parent / "public" / "docs" / "eu-representative-mandate.pdf"
REF = "TS-EU-REP-2026-01"
SIGNED = "3 November 2026"
EFFECTIVE = "16 October 2026"

INK = colors.HexColor("#111111")
MUTED = colors.HexColor("#555555")
ACCENT = colors.HexColor("#C8102E")
RULE = colors.HexColor("#CCCCCC")

base = dict(fontName="Helvetica", fontSize=9.6, leading=13.6, textColor=INK)
s_title = ParagraphStyle("t", fontName="Helvetica-Bold", fontSize=15, leading=19, alignment=TA_CENTER, textColor=INK)
s_sub = ParagraphStyle("s", fontName="Helvetica", fontSize=9.5, leading=13, alignment=TA_CENTER, textColor=MUTED)
s_h = ParagraphStyle("h", fontName="Helvetica-Bold", fontSize=10.5, leading=14, spaceBefore=10, spaceAfter=4, textColor=INK)
s_p = ParagraphStyle("p", alignment=TA_JUSTIFY, spaceAfter=4, **base)
s_li = ParagraphStyle("li", alignment=TA_JUSTIFY, leftIndent=18, firstLineIndent=-18, spaceAfter=3, **base)
s_cell = ParagraphStyle("c", fontName="Helvetica", fontSize=9, leading=12, textColor=INK)
s_cellb = ParagraphStyle("cb", fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=INK)
s_party = ParagraphStyle("pt", fontName="Helvetica-Bold", fontSize=9.5, leading=13, textColor=ACCENT, spaceBefore=6, spaceAfter=3)
s_small = ParagraphStyle("sm", fontName="Helvetica", fontSize=8, leading=11, textColor=MUTED)


def party_table(rows):
    data = [[Paragraph(k, s_cellb), Paragraph(v, s_cell)] for k, v in rows]
    t = Table(data, colWidths=[52 * mm, None])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, RULE),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ]))
    return t


def sig_block(heading, entity, name, title):
    rows = [
        [Paragraph(heading, s_cellb)],
        [Paragraph(entity, s_cell)],
        [Spacer(1, 16 * mm)],
        [Paragraph("Signature: ______________________________", s_cell)],
        [Paragraph(f"Name: {name}", s_cell)],
        [Paragraph(f"Title: {title}", s_cell)],
        [Paragraph(f"Date: {SIGNED}", s_cell)],
        [Paragraph("Place: ______________________________", s_cell)],
    ]
    t = Table(rows, colWidths=[82 * mm])
    t.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (0, 0), (-1, -1), 2)]))
    return t


def on_page(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(2)
    canvas.line(18 * mm, h - 14 * mm, w - 18 * mm, h - 14 * mm)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(INK)
    canvas.drawString(18 * mm, h - 11 * mm, "TIRESSHOP  ·  SEMEN TI TRADING LLC  ×  BBC TYRES BV")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(w - 18 * mm, h - 11 * mm, f"Ref. {REF}")
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 11 * mm, "EU Representative Appointment Agreement & Written Mandate (Art. 27 GDPR)")
    canvas.drawRightString(w - 18 * mm, 11 * mm, f"Page {doc.page}   ·   Initials: ______ / ______")
    canvas.restoreState()


P = lambda t: Paragraph(t, s_p)
L = lambda t: Paragraph(t, s_li)
H = lambda t: Paragraph(t, s_h)

story = [
    Paragraph("EU REPRESENTATIVE APPOINTMENT AGREEMENT<br/>AND WRITTEN MANDATE", s_title),
    Spacer(1, 3),
    Paragraph("pursuant to Article 27 of Regulation (EU) 2016/679 (General Data Protection Regulation — “GDPR”)", s_sub),
    Spacer(1, 4),
    Paragraph(f"Document reference: <b>{REF}</b> &nbsp;&nbsp;·&nbsp;&nbsp; Date of signature: <b>{SIGNED}</b> &nbsp;&nbsp;·&nbsp;&nbsp; Effective from: <b>{EFFECTIVE}</b>", s_sub),
    Spacer(1, 10),
    P("<b>This Agreement is made between:</b>"),

    Paragraph("1. THE CONTROLLER (PRINCIPAL)", s_party),
    party_table([
        ("Legal name", "Semen Ti Trading LLC"),
        ("Trading name / website", "TiresShop — https://tiresshop.net"),
        ("Legal form", "Limited liability company organised under the laws of the State of California, United States"),
        ("Registration", "California Secretary of State, Entity File No. B20260459523"),
        ("Seller’s permit", "209-079264-00001 (California Department of Tax and Fee Administration)"),
        ("Principal business address", "265 W Tujunga Ave, Apt 126, Burbank, CA 91502, United States"),
        ("Address for legal notices", "6550 Yucca Street, Apt 205, Los Angeles, CA 90028, United States"),
        ("Represented by", "Semen Titov, Managing Member"),
        ("Contact", "info@tiresshop.net · +1 (747) 287-6583"),
    ]),
    P("(hereinafter the “<b>Controller</b>”)"),

    Paragraph("2. THE EU REPRESENTATIVE", s_party),
    party_table([
        ("Legal name", "BBC TYRES BV"),
        ("Legal form", "Besloten vennootschap (private limited company) under Belgian law"),
        ("Enterprise number (KBO/BCE)", "0794.652.803"),
        ("Registered office", "Luitenant Graffplein 15, 1780 Wemmel, Belgium"),
        ("Incorporation", "Deed of incorporation of 6 December 2022 executed before notary Jean Van den Wouwer, Brussels; filed on 12 December 2022 and published in the Annexes to the Belgian Official Gazette on 14 December 2022 (ref. 22381428)"),
        ("Represented by", "Mr Berkay Cetin, Director (bestuurder)"),
        ("Contact for EU data subjects and authorities", "info@tiresshop.net, or by post to the registered office above"),
    ]),
    P("(hereinafter the “<b>EU Representative</b>”; the Controller and the EU Representative together the “<b>Parties</b>”)"),

    H("RECITALS"),
    L("(A)&nbsp;&nbsp;The Controller operates the online store “TiresShop” (https://tiresshop.net) from the United States and offers tyres, wheels and brake components to consumers in the Member States of the European Union through its EU storefront."),
    L("(B)&nbsp;&nbsp;The Controller has no establishment in the European Union. Because it offers goods to data subjects in the Union, Article 3(2)(a) GDPR applies, and Article 27(1) GDPR requires the Controller to designate a representative in the Union in writing."),
    L("(C)&nbsp;&nbsp;The EU Representative is established in Belgium, a Member State in which data subjects whose personal data are processed in relation to the offering of goods are located (Article 27(3) GDPR), and operates in the tyre and wheel trade. It agrees to act as the Controller’s representative on the terms of this Agreement."),

    H("1. DESIGNATION AND WRITTEN MANDATE"),
    L("1.1&nbsp;&nbsp;The Controller hereby designates the EU Representative as its representative in the European Union within the meaning of Article 4(17) and Article 27 GDPR, and the EU Representative accepts this designation."),
    L("1.2&nbsp;&nbsp;The EU Representative is mandated to be addressed, in addition to or instead of the Controller, by (a) the supervisory authorities of all EU Member States and (b) data subjects in the European Union, on all issues related to the processing of personal data by the Controller, for the purpose of ensuring compliance with the GDPR (Article 27(4) GDPR)."),
    L("1.3&nbsp;&nbsp;This Agreement constitutes the written mandate required by Article 27(1) GDPR and Recital 80 GDPR. The EU Representative may present it to any supervisory authority as proof of its designation."),

    H("2. DUTIES OF THE EU REPRESENTATIVE"),
    L("2.1&nbsp;&nbsp;<b>Point of contact.</b> Act as the Controller��s point of contact in the European Union for data subjects and supervisory authorities, and accept correspondence addressed to the Controller at its registered office."),
    L("2.2&nbsp;&nbsp;<b>Forwarding.</b> Forward to the Controller at info@tiresshop.net, without undue delay and in any event within two (2) business days of receipt, every request, complaint or communication received in that capacity, including data subject requests under Articles 15 to 22 GDPR."),
    L("2.3&nbsp;&nbsp;<b>Record of processing.</b> Hold a current copy of the Controller’s record of processing activities and make it available to a supervisory authority on request (Article 30(1), (2) and (4) GDPR)."),
    L("2.4&nbsp;&nbsp;<b>Cooperation.</b> Cooperate with the supervisory authorities, on request and in coordination with the Controller, in the performance of their tasks (Article 31 GDPR)."),
    L("2.5&nbsp;&nbsp;<b>Language.</b> Handle communications in Dutch, French or English, and pass them on to the Controller in English where reasonably possible."),
    L("2.6&nbsp;&nbsp;<b>Limits.</b> The EU Representative does not determine the purposes or means of processing, does not process customer data for its own purposes, and does not act as the Controller’s data protection officer, processor or commercial agent."),

    H("3. OBLIGATIONS OF THE CONTROLLER"),
    L("3.1&nbsp;&nbsp;<b>Disclosure.</b> Publish the name, postal address and contact details of the EU Representative in its Privacy Policy, Legal Notice and Contact pages (Articles 13(1)(a) and 14(1)(a) GDPR). The Controller may publish a copy of this Agreement on its website."),
    L("3.2&nbsp;&nbsp;<b>Information.</b> Provide the EU Representative with its current Privacy Policy, Cookie Policy and record of processing activities, and notify it of any material change."),
    L("3.3&nbsp;&nbsp;<b>Responses.</b> Answer data subject requests and authority enquiries forwarded by the EU Representative within the time limits set by the GDPR, and keep the EU Representative informed where its cooperation is required."),
    L("3.4&nbsp;&nbsp;<b>Responsibility.</b> The Controller remains solely responsible for the lawfulness of its processing and for compliance with the GDPR. The designation of the EU Representative is without prejudice to legal actions which could be initiated against the Controller itself (Article 27(5) GDPR)."),
    L("3.5&nbsp;&nbsp;<b>Indemnity.</b> To the extent permitted by law, the Controller shall indemnify the EU Representative against fines, damages and reasonable costs imposed on or incurred by it solely by reason of its role as representative, except where caused by the EU Representative’s own wilful misconduct or gross negligence."),

    H("4. CONFIDENTIALITY AND DATA PROTECTION"),
    L("4.1&nbsp;&nbsp;The EU Representative shall keep confidential all personal data, correspondence and business information received under this Agreement, use it only to perform this Agreement, and protect it with appropriate technical and organisational measures."),
    L("4.2&nbsp;&nbsp;These obligations do not apply to disclosures required by law or requested by a competent supervisory authority, and they survive termination of this Agreement."),

    H("5. FEES AND COSTS"),
    L("5.1&nbsp;&nbsp;Any fee for the services under this Agreement shall be agreed separately in writing between the Parties. Each Party bears its own costs unless otherwise agreed."),

    H("6. TERM AND TERMINATION"),
    L(f"6.1&nbsp;&nbsp;This Agreement is signed on {SIGNED}. By mutual agreement of the Parties, it takes effect retroactively from {EFFECTIVE}, the date of formation of the Controller (the “<b>Effective Date</b>”), and covers all communications received by the EU Representative on the Controller’s behalf since that date. It continues for an indefinite term."),
    L("6.2&nbsp;&nbsp;Either Party may terminate it by giving thirty (30) days’ written notice (email being sufficient). Either Party may terminate with immediate effect if the other materially breaches this Agreement and fails to remedy the breach within ten (10) days of written notice."),
    L("6.3&nbsp;&nbsp;Upon termination, the Controller shall promptly update its website disclosures, and the EU Representative shall continue to forward any communication received for a period of sixty (60) days."),

    H("7. GOVERNING LAW AND JURISDICTION"),
    L("7.1&nbsp;&nbsp;This Agreement is governed by the laws of Belgium, without prejudice to the mandatory provisions of the GDPR."),
    L("7.2&nbsp;&nbsp;The courts of Brussels shall have exclusive jurisdiction over any dispute arising out of or in connection with this Agreement."),

    H("8. FINAL PROVISIONS"),
    L("8.1&nbsp;&nbsp;This Agreement constitutes the entire agreement between the Parties on its subject matter. Amendments must be made in writing and signed by both Parties."),
    L("8.2&nbsp;&nbsp;If any provision is held invalid, the remaining provisions remain in force, and the Parties shall replace the invalid provision with a valid one that comes closest to its purpose."),
    L("8.3&nbsp;&nbsp;This Agreement is drawn up in English in two original counterparts, one for each Party. It may be signed electronically and in counterparts."),
    Spacer(1, 10),
    P("IN WITNESS WHEREOF, the Parties have signed this Agreement by their duly authorised representatives."),
    Spacer(1, 8),
]

sigs = Table(
    [[
        sig_block("FOR THE CONTROLLER", "Semen Ti Trading LLC (TiresShop)", "Semen Titov", "Managing Member"),
        sig_block("FOR THE EU REPRESENTATIVE", "BBC TYRES BV (KBO/BCE 0794.652.803)", "Berkay Cetin", "Director (bestuurder)"),
    ]],
    colWidths=[87 * mm, 87 * mm],
)
sigs.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0)]))
story.append(KeepTogether([sigs]))
story.append(Spacer(1, 12))
story.append(Paragraph(
    "Public notice for data subjects: the EU representative of Semen Ti Trading LLC (TiresShop) under Article 27 GDPR is "
    "BBC TYRES BV, Luitenant Graffplein 15, 1780 Wemmel, Belgium (KBO/BCE 0794.652.803). Data subjects and supervisory "
    "authorities may contact the representative at that address or by email at info@tiresshop.net.",
    s_small,
))

OUT.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(
    str(OUT), pagesize=A4,
    leftMargin=18 * mm, rightMargin=18 * mm, topMargin=22 * mm, bottomMargin=20 * mm,
    title="EU Representative Appointment Agreement & Written Mandate",
    author="Semen Ti Trading LLC (TiresShop)",
    subject="Designation of BBC TYRES BV as EU representative pursuant to Article 27 GDPR",
)
doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
print("ok", OUT)
