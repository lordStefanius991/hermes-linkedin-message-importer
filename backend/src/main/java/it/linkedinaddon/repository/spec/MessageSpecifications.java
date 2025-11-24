package it.linkedinaddon.repository.spec;

import it.linkedinaddon.entity.MessageEntity;
import org.springframework.data.jpa.domain.Specification;

public class MessageSpecifications {

    // FILTRO PER SENDER
    public static Specification<MessageEntity> bySender(String sender) {
        return (root, query, builder) ->
                sender == null ?
                        builder.conjunction() :
                        builder.like(
                                builder.lower(root.get("senderName")),
                                "%" + sender.toLowerCase() + "%"
                        );
    }

    // FILTRO PER SNIPPET / CONTENUTO DEL MESSAGGIO
    public static Specification<MessageEntity> bySnippet(String snippetPart) {
        return (root, query, builder) ->
                snippetPart == null ?
                        builder.conjunction() :
                        builder.like(
                                builder.lower(root.get("snippet")),
                                "%" + snippetPart.toLowerCase() + "%"
                        );
    }

    // FILTRO PER PRIORITY
    public static Specification<MessageEntity> byPriority(String priority) {
        return (root, query, builder) ->
                priority == null ?
                        builder.conjunction() :
                        builder.equal(root.get("priority"), priority);
    }

    // FILTRO PER TAG
    public static Specification<MessageEntity> byTag(String tag) {
        return (root, query, builder) ->
                tag == null ?
                        builder.conjunction() :
                        builder.isMember(tag, root.get("tags"));
    }
}
