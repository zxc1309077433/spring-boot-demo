package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "paper_questions")
public class PaperQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "paper_id")
    @JsonIgnore
    private Paper paper;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;

    private Integer orderNum;

    private Integer score;

    public PaperQuestion() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Paper getPaper() { return paper; }
    public void setPaper(Paper paper) { this.paper = paper; }
    public Question getQuestion() { return question; }
    public void setQuestion(Question question) { this.question = question; }
    public Integer getOrderNum() { return orderNum; }
    public void setOrderNum(Integer orderNum) { this.orderNum = orderNum; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
}
