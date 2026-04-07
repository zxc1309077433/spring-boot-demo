package com.example.demo.repository;

import com.example.demo.entity.PaperQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaperQuestionRepository extends JpaRepository<PaperQuestion, Long> {
    List<PaperQuestion> findByPaperIdOrderByOrderNumAsc(Long paperId);
    void deleteByPaperId(Long paperId);
}
