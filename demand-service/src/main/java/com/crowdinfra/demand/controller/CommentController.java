package com.crowdinfra.demand.controller;

import com.crowdinfra.demand.model.Comment;
import com.crowdinfra.demand.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/{demandId}")
    public ResponseEntity<Comment> addComment(
            @PathVariable String demandId,
            @RequestHeader("X-User-Id") String userId,
            @RequestBody Map<String, String> payload) {
        
        String text = payload.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        Comment created = commentService.addComment(demandId, userId, text);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{demandId}")
    public ResponseEntity<List<Comment>> getComments(@PathVariable String demandId) {
        List<Comment> comments = commentService.getComments(demandId);
        return ResponseEntity.ok(comments);
    }
}
