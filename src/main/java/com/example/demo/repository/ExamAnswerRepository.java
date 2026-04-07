package com.example.demo.repository;

import com.example.demo.entity.ExamAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamAnswerRepository extends JpaRepository<ExamAnswer, Long> {
    List<ExamAnswer> findByExamId(Long examId);
}
