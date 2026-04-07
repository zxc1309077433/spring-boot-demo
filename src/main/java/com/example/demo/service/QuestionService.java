package com.example.demo.service;

import com.example.demo.entity.Category;
import com.example.demo.entity.Question;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;

    public QuestionService(QuestionRepository questionRepository, CategoryRepository categoryRepository) {
        this.questionRepository = questionRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Question> findAll() {
        return questionRepository.findAll();
    }

    public Optional<Question> findById(Long id) {
        return questionRepository.findById(id);
    }

    public List<Question> findByCategoryId(Long categoryId) {
        return questionRepository.findByCategoryId(categoryId);
    }

    public Question save(Question question, Long categoryId) {
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("分类不存在"));
            question.setCategory(category);
        }
        return questionRepository.save(question);
    }

    public Question update(Long id, Question question, Long categoryId) {
        Question existing = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("题目不存在"));
        existing.setContent(question.getContent());
        existing.setType(question.getType());
        existing.setOptions(question.getOptions());
        existing.setAnswer(question.getAnswer());
        existing.setScore(question.getScore());
        existing.setDifficulty(question.getDifficulty());
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("分类不存在"));
            existing.setCategory(category);
        }
        return questionRepository.save(existing);
    }

    public void delete(Long id) {
        questionRepository.deleteById(id);
    }

    public long countByCategory(Long categoryId) {
        return questionRepository.countByCategoryId(categoryId);
    }
}
