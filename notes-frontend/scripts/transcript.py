#!/usr/bin/env python3
"""
Génère un relevé de notes PDF (ReportLab).

Usage:
    python3 transcript.py <input.json> <output.pdf>

Le fichier <input.json> contient la structure produite par buildTranscript():
    {
      "student": { "id", "matricule", "name", "email", "birthDate", "phone", "address" },
      "promotion": { "id", "name", "level", "field", "academicYear" },
      "semesters": [
        {
          "semester": "S1",
          "courses": [ { "code","name","coefficient","credits","value","comment","mention","teacherName" } ],
          "average": 12.5,
          "totalCredits": 30,
          "validatedCredits": 24
        }
      ],
      "overallAverage": 12.5,
      "totalCredits": 60,
      "validatedCredits": 48,
      "mention": "Assez Bien"
    }
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.pdfgen import canvas


# Palette épurée : teal principal, gris foncé pour les titres
TEAL = colors.HexColor("#1ABC9C")
DARK = colors.HexColor("#2C3E50")
LIGHT = colors.HexColor("#ECF0F1")
ORANGE = colors.HexColor("#E67E22")
BORDER = colors.HexColor("#BDC3C7")


def build_styles():
    ss = getSampleStyleSheet()
    styles = {
        "school": ParagraphStyle(
            "school",
            parent=ss["Normal"],
            fontName="Helvetica-Bold",
            fontSize=18,
            textColor=DARK,
            alignment=TA_CENTER,
            spaceAfter=2,
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            parent=ss["Normal"],
            fontName="Helvetica",
            fontSize=10,
            textColor=colors.HexColor("#7F8C8D"),
            alignment=TA_CENTER,
            spaceAfter=12,
        ),
        "doc_title": ParagraphStyle(
            "doc_title",
            parent=ss["Normal"],
            fontName="Helvetica-Bold",
            fontSize=14,
            textColor=colors.white,
            alignment=TA_CENTER,
            spaceBefore=4,
            spaceAfter=4,
        ),
        "section": ParagraphStyle(
            "section",
            parent=ss["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=DARK,
            spaceBefore=10,
            spaceAfter=4,
        ),
        "info_label": ParagraphStyle(
            "info_label",
            parent=ss["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=colors.HexColor("#7F8C8D"),
        ),
        "info_value": ParagraphStyle(
            "info_value",
            parent=ss["Normal"],
            fontName="Helvetica",
            fontSize=10,
            textColor=DARK,
        ),
        "cell": ParagraphStyle(
            "cell",
            parent=ss["Normal"],
            fontName="Helvetica",
            fontSize=9,
            textColor=DARK,
        ),
        "cell_bold": ParagraphStyle(
            "cell_bold",
            parent=ss["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=DARK,
        ),
        "cell_center": ParagraphStyle(
            "cell_center",
            parent=ss["Normal"],
            fontName="Helvetica",
            fontSize=9,
            textColor=DARK,
            alignment=TA_CENTER,
        ),
        "cell_center_bold": ParagraphStyle(
            "cell_center_bold",
            parent=ss["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10,
            textColor=TEAL,
            alignment=TA_CENTER,
        ),
        "footer": ParagraphStyle(
            "footer",
            parent=ss["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=8,
            textColor=colors.HexColor("#7F8C8D"),
            alignment=TA_CENTER,
        ),
        "sig": ParagraphStyle(
            "sig",
            parent=ss["Normal"],
            fontName="Helvetica",
            fontSize=9,
            textColor=DARK,
            alignment=TA_CENTER,
        ),
    }
    return styles


def fmt(x):
    """Format a number to French 2-decimal."""
    if x is None:
        return "—"
    s = f"{float(x):.2f}".replace(".", ",")
    return s


def page_decoration(canv: canvas.Canvas, doc):
    canv.saveState()
    # Top header band
    canv.setFillColor(DARK)
    canv.rect(0, A4[1] - 18 * mm, A4[0], 18 * mm, fill=1, stroke=0)
    # Teal accent strip under header
    canv.setFillColor(TEAL)
    canv.rect(0, A4[1] - 19 * mm, A4[0], 1 * mm, fill=1, stroke=0)
    # School name on the left of header
    canv.setFillColor(colors.white)
    canv.setFont("Helvetica-Bold", 12)
    canv.drawString(18 * mm, A4[1] - 11 * mm, "UNIVERSITÉ NUMÉRIQUE DU MALI")
    canv.setFont("Helvetica", 9)
    canv.drawString(18 * mm, A4[1] - 15 * mm, "Dossier Scolarité — Relevé de Notes Officiel")
    # Document ref on the right
    canv.setFont("Helvetica-Oblique", 9)
    canv.drawRightString(
        A4[0] - 18 * mm, A4[1] - 11 * mm, "Année académique 2024-2025"
    )
    canv.drawRightString(
        A4[0] - 18 * mm, A4[1] - 15 * mm, "Document confidentiel"
    )
    # Footer
    canv.setFillColor(colors.HexColor("#7F8C8D"))
    canv.setFont("Helvetica-Oblique", 8)
    canv.drawString(
        18 * mm,
        10 * mm,
        "Relevé généré électroniquement — Université Numérique du Mali",
    )
    canv.drawRightString(A4[0] - 18 * mm, 10 * mm, f"Page {doc.page}")
    canv.restoreState()


def build(data: dict, out_path: str):
    styles = build_styles()
    doc = BaseDocTemplate(
        out_path,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=28 * mm,
        bottomMargin=20 * mm,
        title="Relevé de Notes",
        author="Université Numérique du Mali",
    )
    frame = Frame(
        doc.leftMargin,
        doc.bottomMargin,
        doc.width,
        doc.height,
        id="main",
    )
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=page_decoration)])

    story = []

    student = data.get("student", {})
    promotion = data.get("promotion", {})
    semesters = data.get("semesters", [])
    overall = data.get("overallAverage")
    mention = data.get("mention", "—")
    total_credits = data.get("totalCredits", 0)
    validated = data.get("validatedCredits", 0)

    # Title banner
    banner_data = [[Paragraph("RELEVÉ DE NOTES OFFICIEL", styles["doc_title"])]]
    banner = Table(banner_data, colWidths=[doc.width])
    banner.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), TEAL),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(banner)
    story.append(Spacer(1, 8 * mm))

    # Student info — 2 columns table
    info_rows = [
        [
            Paragraph("Matricule", styles["info_label"]),
            Paragraph(student.get("matricule", "—"), styles["info_value"]),
            Paragraph("Nom & Prénom", styles["info_label"]),
            Paragraph(student.get("name", "—"), styles["info_value"]),
        ],
        [
            Paragraph("Email", styles["info_label"]),
            Paragraph(student.get("email", "—"), styles["info_value"]),
            Paragraph("Promotion", styles["info_label"]),
            Paragraph(promotion.get("name", "—"), styles["info_value"]),
        ],
        [
            Paragraph("Niveau", styles["info_label"]),
            Paragraph(promotion.get("level", "—"), styles["info_value"]),
            Paragraph("Filière", styles["info_label"]),
            Paragraph(promotion.get("field", "—"), styles["info_value"]),
        ],
        [
            Paragraph("Année académique", styles["info_label"]),
            Paragraph(promotion.get("academicYear", "—"), styles["info_value"]),
            Paragraph("Date de naissance", styles["info_label"]),
            Paragraph(student.get("birthDate", "—") or "—", styles["info_value"]),
        ],
    ]
    info = Table(
        info_rows,
        colWidths=[
            doc.width * 0.22,
            doc.width * 0.28,
            doc.width * 0.22,
            doc.width * 0.28,
        ],
    )
    info.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.white),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(info)
    story.append(Spacer(1, 6 * mm))

    # Per-semester tables
    for sem in semesters:
        # Section header
        sec = Table(
            [
                [
                    Paragraph(
                        f"Semestre {sem.get('semester', '')}",
                        styles["section"],
                    ),
                    Paragraph(
                        f"Moyenne: {fmt(sem.get('average'))} / 20",
                        styles["cell_center_bold"],
                    ),
                ]
            ],
            colWidths=[doc.width * 0.6, doc.width * 0.4],
        )
        sec.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                    ("LINEBELOW", (0, 0), (-1, -1), 1, TEAL),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ]
            )
        )
        story.append(sec)
        story.append(Spacer(1, 3))

        # Courses table
        head = [
            Paragraph("Code", styles["info_label"]),
            Paragraph("Matière", styles["info_label"]),
            Paragraph("Coef.", styles["info_label"]),
            Paragraph("Crédits", styles["info_label"]),
            Paragraph("Note /20", styles["info_label"]),
            Paragraph("Mention", styles["info_label"]),
        ]
        rows = [head]
        for c in sem.get("courses", []):
            rows.append(
                [
                    Paragraph(c.get("code", ""), styles["cell_bold"]),
                    Paragraph(c.get("name", ""), styles["cell"]),
                    Paragraph(
                        fmt(c.get("coefficient")).replace(",00", ""),
                        styles["cell_center"],
                    ),
                    Paragraph(str(c.get("credits", "")), styles["cell_center"]),
                    Paragraph(fmt(c.get("value")), styles["cell_center_bold"]),
                    Paragraph(c.get("mention", "—"), styles["cell_center"]),
                ]
            )
        # footer row: averages + credits
        rows.append(
            [
                Paragraph("", styles["cell"]),
                Paragraph("TOTAUX / MOYENNE", styles["cell_bold"]),
                Paragraph(
                    fmt(
                        sum(
                            float(c.get("coefficient", 0) or 0)
                            for c in sem.get("courses", [])
                        )
                    ).replace(",00", ""),
                    styles["cell_center_bold"],
                ),
                Paragraph(
                    f"{sem.get('validatedCredits', 0)}/{sem.get('totalCredits', 0)}",
                    styles["cell_center_bold"],
                ),
                Paragraph(fmt(sem.get("average")), styles["cell_center_bold"]),
                Paragraph("", styles["cell_center"]),
            ]
        )

        cw = [
            doc.width * 0.12,
            doc.width * 0.36,
            doc.width * 0.10,
            doc.width * 0.12,
            doc.width * 0.14,
            doc.width * 0.16,
        ]
        tbl = Table(rows, colWidths=cw, repeatRows=1)
        tbl_style = [
            ("BACKGROUND", (0, 0), (-1, 0), DARK),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("TOPPADDING", (0, 0), (-1, 0), 6),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 1), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 4),
            ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, LIGHT]),
            ("LINEBELOW", (0, -2), (-1, -2), 0.5, BORDER),
            ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#FAFAFA")),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("LINEABOVE", (0, -1), (-1, -1), 1, DARK),
        ]
        # Highlight failing notes in red, excellent in green/teal
        for i, c in enumerate(sem.get("courses", []), start=1):
            v = float(c.get("value", 0) or 0)
            if v < 10:
                tbl_style.append(("TEXTCOLOR", (4, i), (4, i), ORANGE))
            elif v >= 14:
                tbl_style.append(("TEXTCOLOR", (4, i), (4, i), TEAL))
        tbl.setStyle(TableStyle(tbl_style))
        story.append(tbl)
        story.append(Spacer(1, 6 * mm))

    # Overall summary box
    summary = [
        [
            Paragraph("MOYENNE GÉNÉRALE", styles["info_label"]),
            Paragraph("MENTION", styles["info_label"]),
            Paragraph("CRÉDITS VALIDÉS", styles["info_label"]),
        ],
        [
            Paragraph(f"{fmt(overall)} / 20", styles["cell_center_bold"]),
            Paragraph(mention, styles["cell_center_bold"]),
            Paragraph(f"{validated} / {total_credits}", styles["cell_center_bold"]),
        ],
    ]
    s_tbl = Table(
        summary,
        colWidths=[doc.width * 0.33, doc.width * 0.34, doc.width * 0.33],
    )
    s_tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), DARK),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("BACKGROUND", (0, 1), (-1, 1), LIGHT),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.white),
            ]
        )
    )
    story.append(s_tbl)
    story.append(Spacer(1, 12 * mm))

    # Signature line
    sig_rows = [
        [
            Paragraph("Le Responsable de la Scolarité", styles["sig"]),
            Paragraph("Le Doyen de la Faculté", styles["sig"]),
        ],
        ["", ""],
        [
            Paragraph("________________________", styles["sig"]),
            Paragraph("________________________", styles["sig"]),
        ],
    ]
    sig = Table(sig_rows, colWidths=[doc.width * 0.5, doc.width * 0.5])
    sig.setStyle(
        TableStyle(
            [
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(sig)
    story.append(Spacer(1, 4 * mm))
    story.append(
        Paragraph(
            "Ce relevé est délivré à la demande de l'étudiant pour faire valoir ce que de droit. "
            "Les mentions sont attribuées selon les seuils officiels : Passable ≥ 10, Assez Bien ≥ 12, "
            "Bien ≥ 14, Très Bien ≥ 16.",
            styles["footer"],
        )
    )

    doc.build(story)


def main():
    if len(sys.argv) != 3:
        print("Usage: python3 transcript.py <input.json> <output.pdf>", file=sys.stderr)
        sys.exit(2)
    in_path = sys.argv[1]
    out_path = sys.argv[2]
    data = json.loads(Path(in_path).read_text(encoding="utf-8"))
    build(data, out_path)


if __name__ == "__main__":
    main()
