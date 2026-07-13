package com.notes.exception;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class NotesException extends RuntimeException {
    private final HttpStatus status;
    private final String code;
    public NotesException(String message, HttpStatus status, String code) { super(message); this.status=status; this.code=code; }
    public static NotesException notFound(String r) { return new NotesException(r+" introuvable", HttpStatus.NOT_FOUND,"NOT_FOUND"); }
    public static NotesException conflict(String m) { return new NotesException(m, HttpStatus.CONFLICT,"CONFLICT"); }
    public static NotesException forbidden(String m) { return new NotesException(m, HttpStatus.FORBIDDEN,"FORBIDDEN"); }
    public static NotesException badRequest(String m) { return new NotesException(m, HttpStatus.BAD_REQUEST,"BAD_REQUEST"); }
}
