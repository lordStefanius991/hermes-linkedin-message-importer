package it.linkedinaddon.repository;

import it.linkedinaddon.entity.MessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<MessageEntity, Long>,
        JpaSpecificationExecutor<MessageEntity> {

    Optional<MessageEntity> findFirstBySenderNameAndSource(String senderName, String source);

    List<MessageEntity> findByTagsContaining(String tag);
}
