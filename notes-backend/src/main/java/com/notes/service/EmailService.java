package com.notes.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@pkfokam.edu}")
    private String mailFrom;

    @Value("${app.mail.from-name:PKFokam - Gestion des Notes}")
    private String mailFromName;

    @Value("${app.url:http://localhost:4200}")
    private String appUrl;

    /**
     * Envoie un email de notification à l'enseignant lorsqu'il est assigné à une matière.
     */
    @Async
    public void notifyTeacherAssignment(String teacherEmail, String teacherName,
                                         String matiereCode, String matiereIntitule,
                                         String semestreInfo, String promotionInfo) {
        String subject = "📚 Nouvelle assignation — " + matiereCode + " — PKFokam";
        String html = buildHtml(
            "Bonjour " + teacherName + ",",
            "Vous avez été assigné(e) comme enseignant responsable de la matière :",
            "<div style='background:#EFF6FF;border-left:4px solid #2563EB;padding:12px 16px;margin:12px 0;border-radius:4px;'>" +
            "<strong style='font-size:16px;color:#1B3A6B;'>" + matiereCode + " — " + matiereIntitule + "</strong><br>" +
            "<span style='color:#64748B;'>Promotion : " + promotionInfo + " | " + semestreInfo + "</span>" +
            "</div>",
            "Connectez-vous au système pour consulter vos matières et commencer la saisie des notes.",
            "Accéder à mon espace"
        );
        send(teacherEmail, subject, html);
    }

    /**
     * Envoie une notification à l'étudiant lorsque ses notes sont saisies.
     */
    @Async
    public void notifyStudentGradeEntry(String studentEmail, String studentName,
                                         String matiereIntitule, double note,
                                         String semestreInfo) {
        String mention = getMentionLabel(note);
        String color = note >= 10 ? "#10B981" : "#EF4444";
        String subject = "📝 Note saisie — " + matiereIntitule + " — PKFokam";
        String html = buildHtml(
            "Bonjour " + studentName + ",",
            "Une note vient d'être saisie pour vous dans la matière :",
            "<div style='background:#F8FAFC;border-left:4px solid " + color + ";padding:12px 16px;margin:12px 0;border-radius:4px;'>" +
            "<strong style='font-size:16px;color:#1E293B;'>" + matiereIntitule + "</strong><br>" +
            "<span style='font-size:24px;font-weight:700;color:" + color + ";'>" + String.format("%.2f", note) + "/20</span>" +
            " <span style='font-size:13px;color:#64748B;'>(" + mention + ")</span><br>" +
            "<span style='color:#64748B;font-size:12px;'>" + semestreInfo + "</span>" +
            "</div>",
            "Connectez-vous pour consulter le détail de vos notes et relevés.",
            "Voir mes notes"
        );
        send(studentEmail, subject, html);
    }

    /**
     * Notification à un enseignant lorsqu'un semestre est ouvert par l'admin.
     */
    @Async
    public void notifySemesterOpened(String enseignantEmail, String enseignantName,
                                      String semestreInfo, String promotionInfo) {
        String subject = "✅ Semestre ouvert — " + semestreInfo + " — PKFokam";
        String html = buildHtml(
            "Bonjour " + enseignantName + ",",
            "Le semestre <strong>" + semestreInfo + "</strong> de la promotion <strong>" + promotionInfo + "</strong> a été ouvert.",
            "Vous pouvez dès à présent connecter au système pour commencer la saisie des notes pour vos matières.",
            "Nous vous prions de bien vouloir saisir les notes dans les délais impartis.",
            "Accéder à mon espace"
        );
        send(enseignantEmail, subject, html);
    }

    /**
     * Notification à un étudiant lorsque les résultats d'un semestre sont disponibles.
     */
    @Async
    public void notifySemesterResultsAvailable(String studentEmail, String studentName,
                                                String semestreInfo, String promotionInfo) {
        String subject = "📊 Résultats disponibles — " + semestreInfo + " — PKFokam";
        String html = buildHtml(
            "Bonjour " + studentName + ",",
            "Les résultats du <strong>" + semestreInfo + "</strong> pour la promotion <strong>" + promotionInfo + "</strong> sont désormais disponibles.",
            "Connectez-vous au système pour consulter vos notes, votre moyenne, votre classement et télécharger votre relevé de notes.",
            "Félicitations pour vos efforts et bonne continuation !",
            "Voir mes résultats"
        );
        send(studentEmail, subject, html);
    }

    /**
     * Notification de verrouillage des notes d'une matière.
     */
    @Async
    public void notifyGradeLock(String enseignantEmail, String enseignantName,
                                 String matiereCode, String matiereIntitule) {
        String subject = "🔒 Notes verrouillées — " + matiereCode + " — PKFokam";
        String html = buildHtml(
            "Bonjour " + enseignantName + ",",
            "Les notes de la matière <strong>" + matiereCode + " — " + matiereIntitule + "</strong> ont été verrouillées avec succès.",
            "Elles ne sont plus modifiables. Vous pouvez désormais générer les relevés et consulter les statistiques.",
            "Connectez-vous pour consulter les résultats.",
            "Voir les statistiques"
        );
        send(enseignantEmail, subject, html);
    }

    /**
     * Envoi générique d'un email HTML.
     */
    @Async
    public void send(String to, String subject, String htmlContent) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(mailFrom, mailFromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(msg);
            log.info("Email envoyé à {} — sujet: {}", to, subject);
        } catch (MessagingException e) {
            log.error("Erreur envoi email à {}: {}", to, e.getMessage());
        } catch (Exception e) {
            log.warn("Impossible d'envoyer l'email à {} (serveur SMPS peut-être non configuré): {}", to, e.getMessage());
        }
    }

    private String buildHtml(String greeting, String intro, String content, String action, String btnLabel) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='margin:0;padding:0;background:#F8FAFC;font-family:Inter,system-ui,sans-serif;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0'><tr><td align='center' style='padding:40px 16px;'>" +
            "<table width='600' cellpadding='0' cellspacing='0' style='background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);'>" +
            "<tr><td style='background:linear-gradient(135deg,#1B3A6B,#2563EB);padding:24px 32px;'>" +
            "<h1 style='color:#FFFFFF;font-size:20px;margin:0;'>🎓 PKFokam Institute of Excellence</h1>" +
            "<p style='color:rgba(255,255,255,.7);margin:4px 0 0;font-size:13px;'>Système de Gestion des Notes Étudiantes</p>" +
            "</td></tr>" +
            "<tr><td style='padding:32px;'>" +
            "<p style='font-size:15px;color:#1E293B;margin:0 0 8px;'>" + greeting + "</p>" +
            "<p style='font-size:14px;color:#475569;margin:0 0 16px;'>" + intro + "</p>" +
            content +
            "<p style='font-size:14px;color:#475569;margin:16px 0 20px;'>" + action + "</p>" +
            "<a href='" + appUrl + "' style='display:inline-block;background:#1B3A6B;color:#FFFFFF;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;'>" + btnLabel + " →</a>" +
            "</td></tr>" +
            "<tr><td style='background:#F8FAFC;padding:16px 32px;border-top:1px solid #E2E8F0;'>" +
            "<p style='font-size:12px;color:#94A3B8;margin:0;text-align:center;'>© " + java.time.Year.now().getValue() + " PKFokam Institute — Ce message est automatique, merci de ne pas y répondre.</p>" +
            "</td></tr></table></td></tr></table></body></html>";
    }

    private String getMentionLabel(double note) {
        if (note >= 16) return "Très Bien";
        if (note >= 14) return "Bien";
        if (note >= 12) return "Assez Bien";
        if (note >= 10) return "Passable";
        return "Ajourné";
    }
}
