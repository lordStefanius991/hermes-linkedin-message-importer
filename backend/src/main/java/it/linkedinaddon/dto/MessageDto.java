package it.linkedinaddon.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class MessageDto {

    private Long id;
    private String senderName;
    private String senderProfileUrl;
    private String snippet;
    private Instant receivedAt;
    private String priority;
    private String source;
    private List<String> tags;

    private String fullText;
    private String threadUrl;
    private Boolean lastFromMe;
}
