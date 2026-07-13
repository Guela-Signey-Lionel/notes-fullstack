package com.notes.dto.response;
import lombok.*;
import org.springframework.data.domain.Page;
import java.util.List;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;
    public static <T> PageResponse<T> of(Page<T> p) {
        return PageResponse.<T>builder().content(p.getContent()).page(p.getNumber()).size(p.getSize()).totalElements(p.getTotalElements()).totalPages(p.getTotalPages()).last(p.isLast()).build();
    }
}
