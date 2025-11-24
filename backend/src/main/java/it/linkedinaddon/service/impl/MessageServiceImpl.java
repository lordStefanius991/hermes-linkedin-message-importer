package it.linkedinaddon.service.impl;

import it.linkedinaddon.dto.MessageDto;
import it.linkedinaddon.dto.MessagePriority;
import it.linkedinaddon.entity.MessageEntity;
import it.linkedinaddon.mapper.MessageMapper;
import it.linkedinaddon.repository.MessageRepository;
import it.linkedinaddon.repository.spec.MessageSpecifications;
import it.linkedinaddon.service.MessageService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class MessageServiceImpl implements MessageService {

    private final MessageRepository repository;
    private final MessageMapper mapper;

    public MessageServiceImpl(MessageRepository repository, MessageMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }


    @Override
    public MessageDto getById(Long id) {
        MessageEntity entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Message not found with id " + id));

        return mapper.toDto(entity);
    }

    // -------------------------------------------------------------------------
    // GET ALL
    // -------------------------------------------------------------------------
    @Override
    public List<MessageDto> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    // -------------------------------------------------------------------------
    // CREATE SINGOLO MESSAGGIO DA UI
    // -------------------------------------------------------------------------
    @Override
    public MessageDto create(MessageDto dto) {

        // valori che ignoriamo in input
        dto.setId(null);
        dto.setSource("DB");
        if (dto.getReceivedAt() == null) {
            dto.setReceivedAt(Instant.now());
        }

        MessageEntity entity = mapper.toEntity(dto);
        MessageEntity saved = repository.save(entity);

        return mapper.toDto(saved);
    }

    // -------------------------------------------------------------------------
    // SEARCH CON SPECIFICATIONS
    // -------------------------------------------------------------------------
    @Override
    public List<MessageDto> search(String sender, String snippetPart, String priority, String tag) {
        return repository.findAll(
                        MessageSpecifications.bySender(sender)
                                .and(MessageSpecifications.bySnippet(snippetPart))
                                .and(MessageSpecifications.byPriority(priority))
                                .and(MessageSpecifications.byTag(tag))
                )
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    // -------------------------------------------------------------------------
    // UPDATE THREAD (SACRO - NON TOCCATO)
    // -------------------------------------------------------------------------
    @Override
    public MessageDto updateThreadBySenderName(String senderName,
                                               String fullText,
                                               Boolean lastFromMe,
                                               String threadUrl,
                                               Instant lastMessageAt) {

        MessageEntity entity = repository
                .findFirstBySenderNameAndSource(senderName, "LINKEDIN_SIDEBAR")
                .orElseThrow(() -> new IllegalArgumentException(
                        "Nessun messaggio trovato per senderName: " + senderName));

        // aggiorniamo last_from_me solo se passato
        if (lastFromMe != null) {
            entity.setLastFromMe(lastFromMe);
        }

        // sempre aggiorniamo il testo completo
        entity.setFullText(fullText);

        // se ci viene passato un threadUrl non vuoto, lo salviamo
        if (threadUrl != null && !threadUrl.isBlank()) {
            entity.setThreadUrl(threadUrl);
        }

        //gestione con stessa data e nuova ora
        if (lastMessageAt != null && entity.getReceivedAt() != null) {
            Instant current = entity.getReceivedAt(); // data già salvata dal bulk

            // componi: data originale + nuova ora
            Instant merged = Instant.ofEpochMilli(
                    current.toEpochMilli() -
                            ((current.getEpochSecond() % 86400) * 1000) + // rimuovi vecchia ora
                            (lastMessageAt.getEpochSecond() % 86400) * 1000 // metti ora nuova
            );

            entity.setReceivedAt(merged);
        }

        MessageEntity saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    // -------------------------------------------------------------------------
    // IMPORT BULK DA ESTENSIONE (DEDUP: senderName + primi 30 char snippet)
    // -------------------------------------------------------------------------
    @Override
    @Transactional
    public List<MessageDto> importBulk(List<MessageDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return List.of();
        }

        // 1) Costruisco l'insieme delle chiavi già esistenti in DB
        //    Chiave = senderName (trim, lower) + "||" + primi 30 char snippet normalizzato
        Set<String> existingKeys = new HashSet<>();

        for (MessageEntity existing : repository.findAll()) {
            String key = buildKey(existing.getSenderName(), existing.getSnippet());
            if (key != null) {
                existingKeys.add(key);
            }
        }

        List<MessageDto> result = new ArrayList<>();

        // 2) Scorro i DTO in arrivo
        for (MessageDto dto : dtos) {
            if (dto == null) {
                continue;
            }

            String senderName = trimOrNull(dto.getSenderName());
            String normalizedSnippet = normalizeSnippet(dto.getSnippet());

            // se non ho abbastanza info per identificare la conversazione → skip
            if (senderName == null || normalizedSnippet == null) {
                continue;
            }

            String key = buildKey(senderName, normalizedSnippet);

            // Se la chiave esiste già (in DB o in questo stesso batch) → salta
            if (existingKeys.contains(key)) {
                continue;
            }

            // 3) È un record nuovo → lo salvo
            MessageEntity entity = mapper.toEntity(dto);

            entity.setSenderName(senderName);          // uso la versione trim
            entity.setSnippet(normalizedSnippet);      // versione normalizzata

            if (entity.getReceivedAt() == null) {
                entity.setReceivedAt(Instant.now());
            }

            MessageEntity saved = repository.save(entity);
            existingKeys.add(key);
            result.add(mapper.toDto(saved));
        }

        return result;
    }


    /**
     * Normalizza lo snippet:
     * - trim
     * - comprime spazi multipli
     */
    private String normalizeSnippet(String s) {
        if (s == null) {
            return null;
        }
        String trimmed = s.trim().replaceAll("\\s+", " ");
        return trimmed.isEmpty() ? null : trimmed;
    }

    /**
     * Trimma e converte in null se vuota.
     */
    private String trimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    /**
     * Costruisce la chiave logica:
     * senderName (lower, trim) + "||" + primi 30 caratteri dello snippet normalizzato (lower).
     */
    private String buildKey(String senderName, String snippetNormalized) {
        String s = trimOrNull(senderName);
        String sn = normalizeSnippet(snippetNormalized);

        if (s == null || sn == null) {
            return null;
        }

        int len = Math.min(30, sn.length());
        String prefix = sn.substring(0, len);

        return (s.toLowerCase() + "||" + prefix.toLowerCase());
    }



    @Override
    public MessageDto updatePriority(Long id, MessagePriority priority) {
        MessageEntity entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Message not found with id " + id));

        entity.setPriority(priority);
        MessageEntity saved = repository.save(entity);

        return mapper.toDto(saved);
    }

    @Transactional
    @Override
    public void saveCustomList(String tag, List<Long> messageIds) {
        if (tag == null || tag.isBlank()) {
            throw new IllegalArgumentException("Tag/list name is required");
        }

        // 1) rimuovi il tag da tutti i messaggi che lo hanno
        List<MessageEntity> withTag = repository.findByTagsContaining(tag);
        for (MessageEntity m : withTag) {
            m.getTags().remove(tag);
        }

        if (messageIds == null || messageIds.isEmpty()) {
            return; // lista "cancellata"
        }

        // 2) aggiungi il tag ai messageIds passati
        List<MessageEntity> target = repository.findAllById(messageIds);
        for (MessageEntity m : target) {
            if (m.getTags() == null) {
                m.setTags(new ArrayList<>());
            }
            if (!m.getTags().contains(tag)) {
                m.getTags().add(tag);
            }
        }
    }



}
