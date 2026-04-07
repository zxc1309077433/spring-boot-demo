package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExamService {
    private final ExamRepository examRepository;
    private final PaperRepository paperRepository;
    private final UserRepository userRepository;
    private final ExamAnswerRepository examAnswerRepository;

    public ExamService(ExamRepository examRepository, PaperRepository paperRepository,
                       UserRepository userRepository, ExamAnswerRepository examAnswerRepository) {
        this.examRepository = examRepository;
        this.paperRepository = paperRepository;
        this.userRepository = userRepository;
        this.examAnswerRepository = examAnswerRepository;
    }

    public Exam startExam(Long paperId, Long userId) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("试卷不存在"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Exam exam = new Exam();
        exam.setPaper(paper);
        exam.setUser(user);
        exam.setStartTime(LocalDateTime.now());
        exam.setStatus(Exam.ExamStatus.IN_PROGRESS);
        return examRepository.save(exam);
    }

    @Transactional
    public Exam submitExam(Long examId, Map<Long, String> answers) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("考试不存在"));

        if (exam.getStatus() == Exam.ExamStatus.FINISHED) {
            throw new RuntimeException("考试已结束");
        }

        int totalScore = 0;
        List<PaperQuestion> paperQuestions = exam.getPaper().getPaperQuestions();

        for (PaperQuestion pq : paperQuestions) {
            Question question = pq.getQuestion();
            String userAnswer = answers.getOrDefault(question.getId(), "");

            ExamAnswer examAnswer = new ExamAnswer();
            examAnswer.setExam(exam);
            examAnswer.setQuestion(question);
            examAnswer.setAnswer(userAnswer);

            boolean correct = question.getAnswer().trim().equalsIgnoreCase(userAnswer.trim());
            examAnswer.setIsCorrect(correct);
            examAnswer.setScore(correct ? pq.getScore() : 0);
            exam.getAnswers().add(examAnswer);

            if (correct) {
                totalScore += pq.getScore();
            }
        }

        exam.setScore(totalScore);
        exam.setEndTime(LocalDateTime.now());
        exam.setStatus(Exam.ExamStatus.FINISHED);
        return examRepository.save(exam);
    }

    public Optional<Exam> findById(Long id) {
        return examRepository.findById(id);
    }

    public List<Exam> findByUserId(Long userId) {
        return examRepository.findByUserId(userId);
    }

    public List<Exam> findAll() {
        return examRepository.findAll();
    }

    public List<Exam> getRankingByPaper(Long paperId) {
        return examRepository.findRankingByPaperId(paperId);
    }

    public List<Exam> getAllRanking() {
        return examRepository.findAllFinishedOrderByScoreDesc();
    }

    public Map<String, Object> getStats() {
        List<Exam> allFinished = examRepository.findAllFinishedOrderByScoreDesc();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalExams", allFinished.size());
        if (!allFinished.isEmpty()) {
            double avg = allFinished.stream().mapToInt(Exam::getScore).average().orElse(0);
            int max = allFinished.stream().mapToInt(Exam::getScore).max().orElse(0);
            int min = allFinished.stream().mapToInt(Exam::getScore).min().orElse(0);
            stats.put("averageScore", Math.round(avg * 10.0) / 10.0);
            stats.put("highestScore", max);
            stats.put("lowestScore", min);
            stats.put("passRate", Math.round(allFinished.stream()
                    .filter(e -> e.getScore() >= 60).count() * 100.0 / allFinished.size() * 10.0) / 10.0);
        }
        return stats;
    }
}
