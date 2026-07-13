package com.notes.service;

import com.notes.dto.response.*;
import com.notes.entity.*;
import com.notes.exception.NotesException;
import com.notes.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.*;
import org.apache.pdfbox.pdmodel.graphics.color.PDColor;
import org.apache.pdfbox.pdmodel.graphics.color.PDDeviceRGB;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service @RequiredArgsConstructor @Slf4j @Transactional
public class ExportService {

    private final EtudiantRepository etudiantRepo;
    private final SemestreRepository semestreRepo;
    private final ReleveRepository releveRepo;
    private final UtilisateurRepository utilisateurRepo;
    private final MatiereRepository matiereRepo;
    private final NoteRepository noteRepo;
    private final MoyenneService moyenneService;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // ══════════════════════════════════════════════════════════════════════
    // PDF — Relevé de notes individuel
    // ══════════════════════════════════════════════════════════════════════
    public byte[] genererReleve(UUID etudiantId, UUID semestreId) {
        Etudiant etudiant = etudiantRepo.findById(etudiantId)
            .orElseThrow(() -> NotesException.notFound("Étudiant"));
        Semestre semestre = semestreRepo.findById(semestreId)
            .orElseThrow(() -> NotesException.notFound("Semestre"));

        MoyenneResponse moyennes = moyenneService.calculerMoyenneEtudiant(etudiantId, semestreId);

        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            float w = page.getMediaBox().getWidth();
            float h = page.getMediaBox().getHeight();

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {

                // ── En-tête ──────────────────────────────────────────────
                drawRect(cs, 0, h - 80, w, 80, new float[]{0.12f, 0.22f, 0.42f});
                drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 20, w / 2, h - 35,
                    "PKFOKAM INSTITUTE OF EXCELLENCE", 1f, 1f, 1f, true);
                drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11, w / 2, h - 55,
                    "Relevé de Notes Officiel", 0.85f, 0.85f, 0.85f, true);

                // ── Bloc infos étudiant ───────────────────────────────────
                float y = h - 110;
                drawRect(cs, 30, y - 65, w - 60, 65, new float[]{0.84f, 0.91f, 0.94f});
                drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 11, 40, y - 18,
                    "INFORMATIONS ÉTUDIANT", 0.12f, 0.22f, 0.42f, false);
                drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10, 40, y - 32,
                    "Étudiant : " + etudiant.getUtilisateur().getNomComplet(), 0.1f, 0.1f, 0.1f, false);
                drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10, 40, y - 44,
                    "N° Étudiant : " + etudiant.getNumeroEtudiant(), 0.1f, 0.1f, 0.1f, false);
                drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10, 40, y - 56,
                    "Promotion : " + semestre.getPromotion().getNom() +
                    " | Semestre " + semestre.getNumero() + " — " + semestre.getAnneeAcademique(),
                    0.1f, 0.1f, 0.1f, false);

                // ── En-tête tableau ───────────────────────────────────────
                float tableY = y - 85;
                drawRect(cs, 30, tableY - 18, w - 60, 18, new float[]{0.12f, 0.22f, 0.42f});
                drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 9, 35,  tableY - 12, "UE / Matière",   1f,1f,1f, false);
                drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 9, 260, tableY - 12, "Coeff",          1f,1f,1f, false);
                drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 9, 305, tableY - 12, "CC",             1f,1f,1f, false);
                drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 9, 345, tableY - 12, "Examen",         1f,1f,1f, false);
                drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 9, 395, tableY - 12, "Note finale",    1f,1f,1f, false);
                drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 9, 460, tableY - 12, "Mention",        1f,1f,1f, false);

                float rowY = tableY - 18;
                int row = 0;

                for (MoyenneUEResponse ue : moyennes.getMoyennesUE()) {
                    // Ligne UE
                    float[] ueBg = {0.91f, 0.95f, 0.98f};
                    drawRect(cs, 30, rowY - 16, w - 60, 16, ueBg);
                    drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 9, 35, rowY - 11,
                        ue.getUeCode() + " — " + ue.getUeIntitule() + " (" + ue.getCreditsEcts() + " ECTS)",
                        0.12f, 0.22f, 0.42f, false);
                    String moyUEStr = ue.getMoyenneUE() != null ? fmt2(ue.getMoyenneUE()) : "—";
                    drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 9, 395, rowY - 11,
                        moyUEStr, ue.isValidee() ? 0.06f : 0.8f, ue.isValidee() ? 0.55f : 0.1f, 0.06f, false);
                    rowY -= 16;

                    // Lignes matières
                    for (NoteDetailResponse nd : ue.getNotes()) {
                        float[] rowBg = (row++ % 2 == 0) ? new float[]{1f,1f,1f} : new float[]{0.97f,0.97f,0.97f};
                        drawRect(cs, 30, rowY - 14, w - 60, 14, rowBg);
                        drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA), 8, 45, rowY - 9,
                            nd.getMatiereCode() + " — " + nd.getMatiereIntitule(), 0.2f, 0.2f, 0.2f, false);
                        drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA), 8, 263, rowY - 9,
                            fmt2(nd.getCoefficient()), 0.2f,0.2f,0.2f, false);
                        drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA), 8, 308, rowY - 9,
                            nd.getNoteCC() != null ? fmt2(nd.getNoteCC()) : "—", 0.2f,0.2f,0.2f, false);
                        drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA), 8, 348, rowY - 9,
                            nd.getNoteExamen() != null ? fmt2(nd.getNoteExamen()) : "—", 0.2f,0.2f,0.2f, false);
                        drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 8, 400, rowY - 9,
                            nd.getNotefinale() != null ? fmt2(nd.getNotefinale()) : "—", 0.1f,0.1f,0.1f, false);
                        rowY -= 14;
                        if (rowY < 120) break; // protection dépassement
                    }
                }

                // ── Bilan ─────────────────────────────────────────────────
                drawRect(cs, 30, rowY - 55, w - 60, 55, new float[]{0.12f, 0.22f, 0.42f});
                drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 11, w / 2, rowY - 16,
                    "RÉSULTAT GLOBAL", 1f, 1f, 1f, true);
                String moyStr = moyennes.getMoyenne() != null ? fmt2(moyennes.getMoyenne()) + " / 20" : "—";
                drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14, w / 2, rowY - 32,
                    "Moyenne : " + moyStr + "   |   Mention : " + (moyennes.getMention() != null ? moyennes.getMention().name().replace("_"," ") : "—"),
                    1f, 1f, 0.4f, true);
                drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10, w / 2, rowY - 46,
                    "Crédits obtenus : " + moyennes.getCreditsObtenus() +
                    "   |   Rang : " + (moyennes.getRang() != null ? moyennes.getRang() : "—") +
                    "   |   Résultat : " + (moyennes.isValide() ? "ADMIS" : "AJOURNÉ"),
                    0.9f, 0.9f, 0.9f, true);

                // ── Pied de page ──────────────────────────────────────────
                drawText(cs, new PDType1Font(Standard14Fonts.FontName.HELVETICA), 8, w / 2, 25,
                    "Document généré le " + java.time.LocalDate.now().format(FMT) +
                    " — PKFokam Institute of Excellence", 0.5f, 0.5f, 0.5f, true);
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();

        } catch (IOException e) {
            log.error("Erreur génération PDF relevé: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur génération PDF", e);
        }
    }

    // ══════════════════════════════════════════════════════════════════════
    // Excel — Classement complet d'une promotion
    // ══════════════════════════════════════════════════════════════════════
    public byte[] genererExcelClassement(UUID promotionId, UUID semestreId) {
        ClassementResponse classement = moyenneService.calculerClassement(promotionId, semestreId);
        Semestre semestre = semestreRepo.findById(semestreId)
            .orElseThrow(() -> NotesException.notFound("Semestre"));

        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            // ── Feuille 1 : Classement ─────────────────────────────────
            XSSFSheet sheet = wb.createSheet("Classement");
            sheet.setColumnWidth(0, 1500);
            sheet.setColumnWidth(1, 5000);
            sheet.setColumnWidth(2, 4000);
            sheet.setColumnWidth(3, 3500);
            sheet.setColumnWidth(4, 3000);
            sheet.setColumnWidth(5, 3500);
            sheet.setColumnWidth(6, 3000);
            sheet.setColumnWidth(7, 3000);

            // Styles
            XSSFCellStyle titleStyle = createStyle(wb, new byte[]{(byte)31,(byte)56,(byte)100}, true, 14, IndexedColors.WHITE.getIndex());
            XSSFCellStyle headerStyle = createStyle(wb, new byte[]{(byte)46,(byte)117,(byte)182}, true, 10, IndexedColors.WHITE.getIndex());
            XSSFCellStyle evenStyle  = createStyle(wb, new byte[]{(byte)242,(byte)246,(byte)250}, false, 10, IndexedColors.AUTOMATIC.getIndex());
            XSSFCellStyle oddStyle   = createStyle(wb, new byte[]{(byte)255,(byte)255,(byte)255}, false, 10, IndexedColors.AUTOMATIC.getIndex());
            XSSFCellStyle admisStyle = createStyle(wb, new byte[]{(byte)220,(byte)252,(byte)231}, true, 10, IndexedColors.DARK_GREEN.getIndex());
            XSSFCellStyle ajournStyle= createStyle(wb, new byte[]{(byte)254,(byte)226,(byte)226}, true, 10, IndexedColors.RED.getIndex());

            // Titre
            Row title = sheet.createRow(0);
            title.setHeightInPoints(28);
            Cell tc = title.createCell(0);
            tc.setCellValue("CLASSEMENT — " + classement.getPromotionNom() + " — " + classement.getSemestreNom());
            tc.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 7));

            // En-têtes
            Row header = sheet.createRow(1);
            header.setHeightInPoints(20);
            String[] cols = {"Rang", "Nom & Prénom", "N° Étudiant", "Moyenne/20", "Mention", "Crédits", "Résultat", "Commentaire"};
            for (int i = 0; i < cols.length; i++) {
                Cell c = header.createCell(i);
                c.setCellValue(cols[i]);
                c.setCellStyle(headerStyle);
            }

            // Données
            int rowNum = 2;
            for (MoyenneResponse m : classement.getClassement()) {
                Row row = sheet.createRow(rowNum);
                row.setHeightInPoints(18);
                XSSFCellStyle rowStyle = rowNum % 2 == 0 ? evenStyle : oddStyle;
                boolean valide = m.isValide();

                setCellValue(row, 0, m.getRang() != null ? m.getRang().toString() : "—", rowStyle);
                setCellValue(row, 1, m.getEtudiantNom(), rowStyle);
                setCellValue(row, 2, m.getNumeroEtudiant(), rowStyle);
                setCellValue(row, 3, m.getMoyenne() != null ? fmt2(m.getMoyenne()) + "/20" : "—", rowStyle);
                setCellValue(row, 4, m.getMention() != null ? m.getMention().name().replace("_"," ") : "—", rowStyle);
                setCellValue(row, 5, String.valueOf(m.getCreditsObtenus()), rowStyle);
                Cell resultCell = row.createCell(6);
                resultCell.setCellValue(valide ? "ADMIS" : "AJOURNÉ");
                resultCell.setCellStyle(valide ? admisStyle : ajournStyle);
                setCellValue(row, 7, "", rowStyle);
                rowNum++;
            }

            // Totaux
            rowNum++;
            Row total = sheet.createRow(rowNum);
            setCellValue(total, 0, "Total étudiants : " + classement.getTotalEtudiants(), headerStyle);
            long admis = classement.getClassement().stream().filter(MoyenneResponse::isValide).count();
            setCellValue(total, 2, "Admis : " + admis, admisStyle);
            setCellValue(total, 4, "Ajournés : " + (classement.getTotalEtudiants() - admis), ajournStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowNum, rowNum, 0, 1));

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            wb.write(baos);
            return baos.toByteArray();

        } catch (IOException e) {
            log.error("Erreur génération Excel: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur génération Excel", e);
        }
    }

    // ══════════════════════════════════════════════════════════════════════
    // Excel — Notes d'une matière
    // ══════════════════════════════════════════════════════════════════════
    public byte[] exporterNotesMatiere(UUID matiereId) {
        Matiere matiere = matiereRepo.findById(matiereId)
            .orElseThrow(() -> NotesException.notFound("Matière"));

        List<Note> notes = noteRepo.findByMatiereId(matiereId);

        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            XSSFSheet sheet = wb.createSheet("Notes - " + matiere.getCode());
            sheet.setColumnWidth(0, 4000);
            sheet.setColumnWidth(1, 6000);
            sheet.setColumnWidth(2, 3500);
            sheet.setColumnWidth(3, 2000);
            sheet.setColumnWidth(4, 2000);
            sheet.setColumnWidth(5, 4000);

            XSSFCellStyle titleStyle = createStyle(wb, new byte[]{(byte)31,(byte)56,(byte)100}, true, 14, IndexedColors.WHITE.getIndex());
            XSSFCellStyle headerStyle = createStyle(wb, new byte[]{(byte)46,(byte)117,(byte)182}, true, 10, IndexedColors.WHITE.getIndex());
            XSSFCellStyle evenStyle  = createStyle(wb, new byte[]{(byte)242,(byte)246,(byte)250}, false, 10, IndexedColors.AUTOMATIC.getIndex());
            XSSFCellStyle oddStyle   = createStyle(wb, new byte[]{(byte)255,(byte)255,(byte)255}, false, 10, IndexedColors.AUTOMATIC.getIndex());

            // Titre
            Row title = sheet.createRow(0);
            title.setHeightInPoints(28);
            Cell tc = title.createCell(0);
            tc.setCellValue("NOTES — " + matiere.getCode() + " — " + matiere.getIntitule());
            tc.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));

            // En-têtes
            Row header = sheet.createRow(1);
            header.setHeightInPoints(20);
            String[] cols = {"N° Étudiant", "Nom & Prénom", "Note /20", "Statut", "Type", "Commentaire"};
            for (int i = 0; i < cols.length; i++) {
                Cell c = header.createCell(i);
                c.setCellValue(cols[i]);
                c.setCellStyle(headerStyle);
            }

            // Données
            int rowNum = 2;
            Map<UUID, List<Note>> notesByEtudiant = new LinkedHashMap<>();
            for (Note n : notes) {
                notesByEtudiant.computeIfAbsent(n.getEtudiant().getId(), k -> new ArrayList<>()).add(n);
            }

            for (Map.Entry<UUID, List<Note>> entry : notesByEtudiant.entrySet()) {
                Etudiant etudiant = etudiantRepo.findById(entry.getKey())
                    .orElse(null);
                String etudiantName = etudiant != null && etudiant.getUtilisateur() != null
                    ? etudiant.getUtilisateur().getNomComplet() : "Inconnu";
                String numero = etudiant != null ? etudiant.getNumeroEtudiant() : "—";

                for (Note note : entry.getValue()) {
                    Row row = sheet.createRow(rowNum);
                    row.setHeightInPoints(18);
                    XSSFCellStyle rowStyle = rowNum % 2 == 0 ? evenStyle : oddStyle;

                    setCellValue(row, 0, numero, rowStyle);
                    setCellValue(row, 1, etudiantName, rowStyle);
                    setCellValue(row, 2, note.getValeur() != null ? fmt2(note.getValeur()) : "—", rowStyle);
                    setCellValue(row, 3, note.getStatut() != null ? note.getStatut().name() : "—", rowStyle);
                    setCellValue(row, 4, note.getTypeNote() != null ? note.getTypeNote().name() : "—", rowStyle);
                    setCellValue(row, 5, note.getCommentaire() != null ? note.getCommentaire() : "", rowStyle);
                    rowNum++;
                }
            }

            // Totaux
            rowNum++;
            Row total = sheet.createRow(rowNum);
            long countPresent = notes.stream().filter(n -> n.getStatut() == StatutNoteEnum.PRESENT).count();
            setCellValue(total, 0, "Total : " + notes.size() + " notes", headerStyle);
            setCellValue(total, 2, "Présents : " + countPresent, headerStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowNum, rowNum, 0, 1));

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            wb.write(baos);
            return baos.toByteArray();

        } catch (IOException e) {
            log.error("Erreur génération Excel notes matière: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur génération Excel", e);
        }
    }

    // ── Helpers PDF ───────────────────────────────────────────────────────
    private void drawRect(PDPageContentStream cs, float x, float y, float w, float h, float[] rgb) throws IOException {
        cs.setNonStrokingColor(rgb[0], rgb[1], rgb[2]);
        cs.addRect(x, y, w, h); cs.fill();
    }

    private void drawText(PDPageContentStream cs, PDFont font, float size,
                          float x, float y, String text, float r, float g, float b,
                          boolean center) throws IOException {
        cs.beginText();
        cs.setFont(font, size);
        cs.setNonStrokingColor(r, g, b);
        if (center) {
            float tw = font.getStringWidth(text) / 1000 * size;
            cs.newLineAtOffset(x - tw / 2, y);
        } else {
            cs.newLineAtOffset(x, y);
        }
        cs.showText(text);
        cs.endText();
    }

    private String fmt2(BigDecimal v) { return v != null ? String.format("%.2f", v) : "—"; }

    // ── Helpers Excel ─────────────────────────────────────────────────────
    private XSSFCellStyle createStyle(XSSFWorkbook wb, byte[] rgb, boolean bold, int fontSize, short fontColor) {
        XSSFCellStyle style = wb.createCellStyle();
        XSSFColor bg = new XSSFColor(rgb, null);
        style.setFillForegroundColor(bg);
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN); style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);  style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        Font font = wb.createFont();
        font.setBold(bold); font.setFontHeightInPoints((short) fontSize);
        font.setColor(fontColor);
        style.setFont(font);
        return style;
    }

    private void setCellValue(Row row, int col, String value, CellStyle style) {
        Cell c = row.createCell(col); c.setCellValue(value); c.setCellStyle(style);
    }
}
