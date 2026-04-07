package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class PaperService {
    private final PaperRepository paperRepository;
    private final PaperQuestionRepository paperQuestionRepository;
    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;

    public PaperService(PaperRepository paperRepository, PaperQuestionRepository paperQuestionRepository,
                        QuestionRepository questionRepository, CategoryRepository categoryRepository) {
        this.paperRepository = paperRepository;
        this.paperQuestionRepository = paperQuestionRepository;
        this.questionRepository = questionRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Paper> findAll() {
        return paperRepository.findAll();
    }

    public Optional<Paper> findById(Long id) {
        return paperRepository.findById(id);
    }

    public Paper save(Paper paper, Long categoryId) {
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("分类不存在"));
            paper.setCategory(category);
        }
        return paperRepository.save(paper);
    }

    public Paper update(Long id, Paper paper, Long categoryId) {
        Paper existing = paperRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("试卷不存在"));
        existing.setTitle(paper.getTitle());
        existing.setTotalScore(paper.getTotalScore());
        existing.setDuration(paper.getDuration());
        existing.setDescription(paper.getDescription());
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("分类不存在"));
            existing.setCategory(category);
        }
        return paperRepository.save(existing);
    }

    @Transactional
    public Paper addQuestions(Long paperId, List<Long> questionIds) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("试卷不存在"));
        int startOrder = paper.getPaperQuestions().size();
        int totalScore = paper.getPaperQuestions().stream()
                .mapToInt(pq -> pq.getScore() != null ? pq.getScore() : 0).sum();

        for (int i = 0; i < questionIds.size(); i++) {
            Question question = questionRepository.findById(questionIds.get(i))
                    .orElseThrow(() -> new RuntimeException("题目不存在"));
            PaperQuestion pq = new PaperQuestion();
            pq.setPaper(paper);
            pq.setQuestion(question);
            pq.setOrderNum(startOrder + i + 1);
            pq.setScore(question.getScore());
            paper.getPaperQuestions().add(pq);
            totalScore += question.getScore();
        }
        paper.setTotalScore(totalScore);
        return paperRepository.save(paper);
    }

    public void delete(Long id) {
        paperRepository.deleteById(id);
    }
}
