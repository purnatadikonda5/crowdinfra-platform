package com.crowdinfra.demand.service;

import com.crowdinfra.demand.model.Comment;
import com.crowdinfra.demand.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    public Comment addComment(String demandId, String userId, String text) {
        Comment comment = Comment.builder()
                .demandId(demandId)
                .userId(userId)
                // Note: In a real system, you might fetch the userName via a sync call to user-service or trust a header.
                // For now, we store a placeholder or require the client to pass it if denormalizing.
                .userName("User-" + userId.substring(0, Math.min(userId.length(), 5))) 
                .text(text)
                .createdAt(LocalDateTime.now())
                .build();
        return commentRepository.save(comment);
    }

    public List<Comment> getComments(String demandId) {
        return commentRepository.findByDemandIdOrderByCreatedAtDesc(demandId);
    }
}
