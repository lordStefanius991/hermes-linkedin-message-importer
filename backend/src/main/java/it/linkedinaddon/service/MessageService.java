package it.linkedinaddon.service;

import it.linkedinaddon.dto.MessageDto;
import it.linkedinaddon.dto.MessagePriority;

import java.time.Instant;
import java.util.List;

public interface MessageService {

    List<MessageDto> getAll();

    MessageDto create(MessageDto dto);

    List<MessageDto> search(String sender, String snippetPart, String priority, String tag);


    List<MessageDto> importBulk(List<MessageDto> dtos);

    MessageDto updateThreadBySenderName(String senderName,
                                        String fullText,
                                        Boolean lastFromMe,
                                        String threadUrl,
                                        Instant lastMessageAt);

    MessageDto updatePriority(Long id, MessagePriority priority);

    void saveCustomList(String tag, List<Long> messageIds);
    MessageDto getById(Long id);
}
