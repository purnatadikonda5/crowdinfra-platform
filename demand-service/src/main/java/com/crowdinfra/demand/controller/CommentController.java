package com.crowdinfra.demand.controller;

import com.crowdinfra.demand.model.Comment;
import com.crowdinfra.demand.service.CommentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/comments")
@Tag(name = "Comments", description = "Endpoints for managing demand comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/{demandId}")
    public ResponseEntity<List<Comment>> getComments(@PathVariable String demandId) {
        return ResponseEntity.ok(commentService.getCommentsForDemand(demandId));
    }

    @PostMapping("/{demandId}")
    public ResponseEntity<Comment> addComment(@PathVariable String demandId, @RequestHeader("X-User-Id") String userId, @RequestBody Comment comment) {
        log.info("User {} adding comment to demand {}", userId, demandId);
        return ResponseEntity.ok(commentService.addComment(demandId, comment, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable String id, @RequestHeader("X-User-Id") String userId, @RequestHeader("X-User-Role") String userRole) {
        log.info("User {} deleting comment {}", userId, id);
        commentService.deleteComment(id, userId, userRole);
        return ResponseEntity.ok().build();
    }
}
