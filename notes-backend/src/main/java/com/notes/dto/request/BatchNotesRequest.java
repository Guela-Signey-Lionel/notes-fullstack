package com.notes.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BatchNotesRequest {
    @NotNull private UUID matiereId;
    @NotEmpty private List<SaisieNoteRequest> notes;
}
