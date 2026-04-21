package com.influencehub.backend.repository;

import com.influencehub.backend.model.Conversation;
import com.influencehub.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findAllByConversationOrderByTimestampAsc(Conversation conversation);
}
