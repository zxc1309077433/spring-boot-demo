package com.example.demo.repository;

import com.example.demo.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByCategoryId(Long categoryId);
    List<Question> findByType(Question.QuestionType type);
    List<Question> findByDifficulty(Question.Difficulty difficulty);
    List<Question> findByCategoryIdAndType(Long categoryId, Question.QuestionType type);
    long countByCategoryId(Long categoryId);
}
