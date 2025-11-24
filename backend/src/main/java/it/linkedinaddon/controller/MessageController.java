package it.linkedinaddon.controller;

import it.linkedinaddon.dto.*;
import it.linkedinaddon.service.MessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    private static final Logger log = LoggerFactory.getLogger(MessageController.class);
    private final MessageService service;

    public MessageController(MessageService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<MessageDto>> getAllMessages() {
        List<MessageDto> messages = service.getAll();
        log.info("Returning {} messages", messages.size());

        return ApiResponse.<List<MessageDto>>builder()
                .success(true)
                .data(messages)
                .message(null)
                .timestamp(Instant.now())
                .build();
    }

    @PostMapping
    public ApiResponse<MessageDto> createMessage(@RequestBody MessageDto dto) {
        log.info("Creating new message from {}", dto.getSenderName());
        MessageDto saved = service.create(dto);

        return ApiResponse.<MessageDto>builder()
                .success(true)
                .data(saved)
                .message("Message created successfully")
                .timestamp(Instant.now())
                .build();
    }

    @GetMapping("/search")
    public ApiResponse<List<MessageDto>> search(
            @RequestParam(name = "sender", required = false) String sender,
            @RequestParam(name = "snippet", required = false) String snippetPart,
            @RequestParam(name = "priority", required = false) String priority,
            @RequestParam(name = "tag", required = false) String tag
    ) {
        List<MessageDto> filtered = service.search(sender, snippetPart, priority, tag);

        return ApiResponse.<List<MessageDto>>builder()
                .success(true)
                .data(filtered)
                .timestamp(Instant.now())
                .build();
    }


    @PostMapping("/bulk")
    public ApiResponse<List<MessageDto>> importBulk(@RequestBody List<MessageDto> dtos) {
        List<MessageDto> saved = service.importBulk(dtos);
        return ApiResponse.<List<MessageDto>>builder()
                .success(true)
                .data(saved)
                .message(null)
                .timestamp(Instant.now())
                .build();
    }


    @PostMapping("/thread")
    public ApiResponse<MessageDto> updateThread(@RequestBody ThreadUpdateRequest request) {

        MessageDto updated = service.updateThreadBySenderName(
                request.getSenderName(),
                request.getFullText(),
                request.getLastFromMe(),
                request.getThreadUrl(),
                request.getLastMessageAt()   // <- nuovo parametro passato al service
        );

        return ApiResponse.<MessageDto>builder()
                .success(true)
                .data(updated)
                .message("Thread aggiornato")
                .timestamp(Instant.now())
                .build();
    }


    @PatchMapping("/{id}/priority")
    public ApiResponse<MessageDto> updatePriority(
            @PathVariable Long id,
            @RequestBody PriorityUpdateRequest request
    ) {
        MessageDto updated = service.updatePriority(id, request.getPriority());

        return ApiResponse.<MessageDto>builder()
                .success(true)
                .data(updated)
                .message("Priorità aggiornata")
                .timestamp(Instant.now())
                .build();
    }

    @PostMapping("/custom-list")
    public ApiResponse<Void> saveCustomList(@RequestBody CustomListRequest req) {
        service.saveCustomList(req.getTag(), req.getMessageIds());

        return ApiResponse.<Void>builder()
                .success(true)
                .data(null)
                .message(null)        // o "OK", come preferisci
                .timestamp(Instant.now())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<MessageDto> getMessageById(@PathVariable Long id) {
        MessageDto dto = service.getById(id);

        return ApiResponse.<MessageDto>builder()
                .success(true)
                .data(dto)
                .message(null)
                .timestamp(Instant.now())
                .build();
    }

}
