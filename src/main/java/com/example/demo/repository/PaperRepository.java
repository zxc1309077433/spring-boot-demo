package com.example.demo.repository;

import com.example.demo.entity.Paper;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaperRepository extends JpaRepository<Paper, Long> {
    List<Paper> findByCategoryId(Long categoryId);
}
