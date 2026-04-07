package com.example.demo.controller.exam;

import com.example.demo.entity.Paper;
import com.example.demo.service.PaperService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/papers")
public class PaperController {
    private final PaperService paperService;

    public PaperController(PaperService paperService) {
        this.paperService = paperService;
    }

    @GetMapping
    public List<Paper> findAll() {
        return paperService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) {
        return paperService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody Map<String, Object> body) {
        try {
            Paper paper = new Paper();
            paper.setTitle((String) body.get("title"));
            paper.setDescription((String) body.get("description"));
            if (body.get("totalScore") != null) paper.setTotalScore((Integer) body.get("totalScore"));
            if (body.get("duration") != null) paper.setDuration((Integer) body.get("duration"));
            Long categoryId = body.get("categoryId") != null ? ((Number) body.get("categoryId")).longValue() : null;
            return ResponseEntity.ok(paperService.save(paper, categoryId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Paper paper = new Paper();
            paper.setTitle((String) body.get("title"));
            paper.setDescription((String) body.get("description"));
            if (body.get("totalScore") != null) paper.setTotalScore((Integer) body.get("totalScore"));
            if (body.get("duration") != null) paper.setDuration((Integer) body.get("duration"));
            Long categoryId = body.get("categoryId") != null ? ((Number) body.get("categoryId")).longValue() : null;
            return ResponseEntity.ok(paperService.update(id, paper, categoryId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/questions")
    public ResponseEntity<?> addQuestions(@PathVariable Long id, @RequestBody Map<String, List<Long>> body) {
        try {
            return ResponseEntity.ok(paperService.addQuestions(id, body.get("questionIds")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        paperService.delete(id);
        return ResponseEntity.ok().build();
    }
}
