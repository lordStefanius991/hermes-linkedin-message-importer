package it.linkedinaddon.entity;

import it.linkedinaddon.dto.MessagePriority;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String senderName;

    @Column(columnDefinition = "TEXT")
    private String senderProfileUrl;

    @Column(columnDefinition = "TEXT")
    private String snippet;

    private Instant receivedAt;

    @Enumerated(EnumType.STRING)
    private MessagePriority priority;

    private String source;

    @ElementCollection
    @CollectionTable(name = "message_tags", joinColumns = @JoinColumn(name = "message_id"))
    @Column(name = "tag")
    private List<String> tags;

    @Column(columnDefinition = "TEXT")
    private String fullText;

    @Column(columnDefinition = "TEXT")
    private String threadUrl;

    // NEW
    @Column(name = "last_from_me")
    private Boolean lastFromMe;

}
