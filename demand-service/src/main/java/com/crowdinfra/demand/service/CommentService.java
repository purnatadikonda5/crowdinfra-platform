package com.crowdinfra.demand.service;

import com.crowdinfra.demand.model.Comment;
import com.crowdinfra.demand.model.Demand;
import com.crowdinfra.demand.repository.CommentRepository;
import com.crowdinfra.demand.repository.DemandRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final DemandRepository demandRepository;

    public CommentService(CommentRepository commentRepository, DemandRepository demandRepository) {
        this.commentRepository = commentRepository;
        this.demandRepository = demandRepository;
    }

    public List<Comment> getCommentsForDemand(String demandId) {
        return commentRepository.findByDemandId(demandId);
    }

    public Comment addComment(String demandId, Comment comment, String userId) {
        Demand demand = demandRepository.findById(demandId)
                .orElseThrow(() -> new RuntimeException("Demand not found"));
                
        comment.setDemandId(demandId);
        comment.setUserId(userId);
        comment.setCreatedAt(LocalDateTime.now());
        
        Comment savedComment = commentRepository.save(comment);
        
        demand.setCommentCount(demand.getCommentCount() + 1);
        demandRepository.save(demand);
        
        log.info("Added comment to demand {}", demandId);
        return savedComment;
    }

    public void deleteComment(String id, String userId, String userRole) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
                
        if (!comment.getUserId().equals(userId) && !"ADMIN".equals(userRole)) {
            throw new RuntimeException("Unauthorized");
        }
        
        String demandId = comment.getDemandId();
        commentRepository.delete(comment);
        
        demandRepository.findById(demandId).ifPresent(demand -> {
            demand.setCommentCount(Math.max(0, demand.getCommentCount() - 1));
            demandRepository.save(demand);
        });
        
        log.info("Deleted comment {}", id);
    }
}
