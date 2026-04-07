package com.example.demo.controller.exam;

import com.example.demo.entity.Exam;
import com.example.demo.service.ExamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exams")
public class ExamController {
    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startExam(@RequestBody Map<String, Long> body) {
        try {
            Exam exam = examService.startExam(body.get("paperId"), body.get("userId"));
            return ResponseEntity.ok(exam);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitExam(@PathVariable Long id, @RequestBody Map<String, String> rawAnswers) {
        try {
            Map<Long, String> answers = new HashMap<>();
            for (Map.Entry<String, String> entry : rawAnswers.entrySet()) {
                try {
                    answers.put(Long.parseLong(entry.getKey()), entry.getValue());
                } catch (NumberFormatException ignored) {}
            }
            Exam exam = examService.submitExam(id, answers);
            return ResponseEntity.ok(exam);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) {
        return examService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Exam> findAll(@RequestParam(required = false) Long userId) {
        if (userId != null) {
            return examService.findByUserId(userId);
        }
        return examService.findAll();
    }

    @GetMapping("/ranking")
    public List<Map<String, Object>> getRanking(@RequestParam(required = false) Long paperId) {
        List<Exam> exams;
        if (paperId != null) {
            exams = examService.getRankingByPaper(paperId);
        } else {
            exams = examService.getAllRanking();
        }
        List<Map<String, Object>> ranking = new ArrayList<>();
        for (int i = 0; i < exams.size(); i++) {
            Exam e = exams.get(i);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("rank", i + 1);
            item.put("examId", e.getId());
            item.put("userId", e.getUser().getId());
            item.put("userName", e.getUser().getName());
            item.put("paperTitle", e.getPaper().getTitle());
            item.put("score", e.getScore());
            item.put("totalScore", e.getPaper().getTotalScore());
            item.put("endTime", e.getEndTime());
            ranking.add(item);
        }
        return ranking;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return examService.getStats();
    }
}
