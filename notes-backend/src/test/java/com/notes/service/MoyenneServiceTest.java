package com.notes.service;

import com.notes.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class MoyenneServiceTest {

    @Mock private com.notes.repository.NoteRepository noteRepo;
    @Mock private com.notes.repository.MatiereRepository matiereRepo;
    @Mock private com.notes.repository.SemestreRepository semestreRepo;
    @Mock private com.notes.repository.EtudiantRepository etudiantRepo;
    @Mock private com.notes.repository.UniteEnseignementRepository ueRepo;
    @Mock private com.notes.repository.MoyenneCalculeeRepository moyenneRepo;
    @InjectMocks private MoyenneService moyenneService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(moyenneService, "seuilPassable",  10.0);
        ReflectionTestUtils.setField(moyenneService, "seuilAssezBien", 12.0);
        ReflectionTestUtils.setField(moyenneService, "seuilBien",      14.0);
        ReflectionTestUtils.setField(moyenneService, "seuilTresBien",  16.0);
    }

    @Test
    void mention_TRES_BIEN_quand_moyenne_superieure_16() {
        MentionEnum mention = invokeMention(18.0);
        assertThat(mention).isEqualTo(MentionEnum.TRES_BIEN);
    }

    @Test
    void mention_BIEN_quand_moyenne_entre_14_et_16() {
        assertThat(invokeMention(14.5)).isEqualTo(MentionEnum.BIEN);
        assertThat(invokeMention(15.99)).isEqualTo(MentionEnum.BIEN);
    }

    @Test
    void mention_ASSEZ_BIEN_quand_moyenne_entre_12_et_14() {
        assertThat(invokeMention(12.0)).isEqualTo(MentionEnum.ASSEZ_BIEN);
        assertThat(invokeMention(13.5)).isEqualTo(MentionEnum.ASSEZ_BIEN);
    }

    @Test
    void mention_PASSABLE_quand_moyenne_entre_10_et_12() {
        assertThat(invokeMention(10.0)).isEqualTo(MentionEnum.PASSABLE);
        assertThat(invokeMention(11.9)).isEqualTo(MentionEnum.PASSABLE);
    }

    @Test
    void mention_AJOURNE_quand_moyenne_inferieure_10() {
        assertThat(invokeMention(9.9)).isEqualTo(MentionEnum.AJOURNE);
        assertThat(invokeMention(0.0)).isEqualTo(MentionEnum.AJOURNE);
    }

    @Test
    void noteFinale_CC_EXAMEN_calcule_correctement() {
        // Note finale = CC*0.4 + Examen*0.6
        // CC=10, Exam=14 → 10*0.4 + 14*0.6 = 4 + 8.4 = 12.40
        Note cc   = buildNote(TypeNote.CC,     BigDecimal.valueOf(10));
        Note exam = buildNote(TypeNote.EXAMEN, BigDecimal.valueOf(14));
        Matiere m = new Matiere(); m.setCoefficient(BigDecimal.ONE);

        BigDecimal result = invokeCalcNotefinale(List.of(cc, exam), m);
        assertThat(result).isEqualByComparingTo(BigDecimal.valueOf(12.40));
    }

    @Test
    void noteFinale_UNIQUE_retourne_directement() {
        Note uniq = buildNote(TypeNote.UNIQUE, BigDecimal.valueOf(15.5));
        Matiere m = new Matiere(); m.setCoefficient(BigDecimal.ONE);
        BigDecimal result = invokeCalcNotefinale(List.of(uniq), m);
        assertThat(result).isEqualByComparingTo(BigDecimal.valueOf(15.5));
    }

    @Test
    void noteFinale_null_quand_aucune_note() {
        Matiere m = new Matiere(); m.setCoefficient(BigDecimal.ONE);
        BigDecimal result = invokeCalcNotefinale(List.of(), m);
        assertThat(result).isNull();
    }

    // ── Helpers réflexion ─────────────────────────────────────────────────
    private MentionEnum invokeMention(double moy) {
        return (MentionEnum) ReflectionTestUtils.invokeMethod(moyenneService, "calculerMention", moy);
    }

    @SuppressWarnings("unchecked")
    private BigDecimal invokeCalcNotefinale(List<Note> notes, Matiere m) {
        return (BigDecimal) ReflectionTestUtils.invokeMethod(moyenneService, "calculerNotefinale", notes, m);
    }

    private Note buildNote(TypeNote type, BigDecimal val) {
        Note n = new Note();
        n.setTypeNote(type);
        n.setValeur(val);
        n.setStatut(StatutNoteEnum.PRESENT);
        return n;
    }
}
