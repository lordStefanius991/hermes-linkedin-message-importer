package it.linkedinaddon.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class ThreadUpdateRequest {
    private String senderName;
    private String fullText;
    private Boolean lastFromMe;
    private String threadUrl;
    Instant lastMessageAt;
}