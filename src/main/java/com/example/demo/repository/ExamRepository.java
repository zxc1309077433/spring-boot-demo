package com.example.demo.repository;

import com.example.demo.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByUserId(Long userId);
    List<Exam> findByPaperId(Long paperId);
    List<Exam> findByUserIdAndStatus(Long userId, Exam.ExamStatus status);

    @Query("SELECT e FROM Exam e WHERE e.paper.id = :paperId AND e.status = 'FINISHED' ORDER BY e.score DESC")
    List<Exam> findRankingByPaperId(Long paperId);

    @Query("SELECT e FROM Exam e WHERE e.status = 'FINISHED' ORDER BY e.score DESC")
    List<Exam> findAllFinishedOrderByScoreDesc();
}
