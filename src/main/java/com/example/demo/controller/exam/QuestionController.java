package com.example.demo.controller.exam;

import com.example.demo.entity.Question;
import com.example.demo.service.QuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {
    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    public List<Question> findAll(@RequestParam(required = false) Long categoryId) {
        if (categoryId != null) {
            return questionService.findByCategoryId(categoryId);
        }
        return questionService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) {
        return questionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody Map<String, Object> body) {
        try {
            Question question = new Question();
            question.setContent((String) body.get("content"));
            question.setType(Question.QuestionType.valueOf((String) body.get("type")));
            question.setOptions((String) body.get("options"));
            question.setAnswer((String) body.get("answer"));
            if (body.get("score") != null) question.setScore((Integer) body.get("score"));
            if (body.get("difficulty") != null) question.setDifficulty(Question.Difficulty.valueOf((String) body.get("difficulty")));
            Long categoryId = body.get("categoryId") != null ? ((Number) body.get("categoryId")).longValue() : null;
            return ResponseEntity.ok(questionService.save(question, categoryId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Question question = new Question();
            question.setContent((String) body.get("content"));
            question.setType(Question.QuestionType.valueOf((String) body.get("type")));
            question.setOptions((String) body.get("options"));
            question.setAnswer((String) body.get("answer"));
            if (body.get("score") != null) question.setScore((Integer) body.get("score"));
            if (body.get("difficulty") != null) question.setDifficulty(Question.Difficulty.valueOf((String) body.get("difficulty")));
            Long categoryId = body.get("categoryId") != null ? ((Number) body.get("categoryId")).longValue() : null;
            return ResponseEntity.ok(questionService.update(id, question, categoryId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        questionService.delete(id);
        return ResponseEntity.ok().build();
    }
}
