package com.example.demo.config;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;
    private final PaperRepository paperRepository;

    @Value("${exam.admin.password:defaultAdminPwd}")
    private String adminPassword;

    @Value("${exam.student.password:defaultStudentPwd}")
    private String studentPassword;

    public DataInitializer(UserRepository userRepository, CategoryRepository categoryRepository,
                           QuestionRepository questionRepository, PaperRepository paperRepository) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.questionRepository = questionRepository;
        this.paperRepository = paperRepository;
    }

    @Override
    public void run(String... args) {
        // Create admin
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(adminPassword);
            admin.setName("管理员");
            admin.setEmail("admin@exam.com");
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
        }

        // Create students
        String[][] students = {{"student1", "张三"}, {"student2", "李四"}, {"student3", "王五"}};
        for (String[] s : students) {
            if (!userRepository.existsByUsername(s[0])) {
                User student = new User();
                student.setUsername(s[0]);
                student.setPassword(studentPassword);
                student.setName(s[1]);
                student.setEmail(s[0] + "@exam.com");
                student.setRole(User.Role.STUDENT);
                userRepository.save(student);
            }
        }

        // Create categories
        if (categoryRepository.count() == 0) {
            Category c1 = new Category(); c1.setName("Java基础"); c1.setDescription("Java编程语言基础知识");
            Category c2 = new Category(); c2.setName("数据库"); c2.setDescription("SQL与数据库相关知识");
            Category c3 = new Category(); c3.setName("前端开发"); c3.setDescription("HTML/CSS/JavaScript相关知识");
            categoryRepository.save(c1);
            categoryRepository.save(c2);
            categoryRepository.save(c3);

            // Java questions
            createQuestion(c1, "Java中哪个关键字用于定义类？",
                    "[\"A. function\", \"B. class\", \"C. define\", \"D. struct\"]",
                    "B", Question.QuestionType.SINGLE_CHOICE, Question.Difficulty.EASY, 5);
            createQuestion(c1, "Java中String是基本数据类型吗？",
                    "[\"A. 是\", \"B. 不是\"]",
                    "B", Question.QuestionType.TRUE_FALSE, Question.Difficulty.EASY, 5);
            createQuestion(c1, "以下哪些是Java的基本数据类型？",
                    "[\"A. int\", \"B. String\", \"C. double\", \"D. boolean\"]",
                    "A,C,D", Question.QuestionType.MULTI_CHOICE, Question.Difficulty.MEDIUM, 10);
            createQuestion(c1, "Java中用于实现多态的机制是什么？",
                    "[\"A. 封装\", \"B. 继承\", \"C. 重写(Override)\", \"D. 重载(Overload)\"]",
                    "C", Question.QuestionType.SINGLE_CHOICE, Question.Difficulty.MEDIUM, 5);
            createQuestion(c1, "Java中final关键字不能修饰以下哪个？",
                    "[\"A. 类\", \"B. 方法\", \"C. 变量\", \"D. 构造方法\"]",
                    "D", Question.QuestionType.SINGLE_CHOICE, Question.Difficulty.HARD, 10);
            createQuestion(c1, "Java的垃圾回收机制主要回收的是____区域的内存。",
                    null, "堆", Question.QuestionType.FILL_BLANK, Question.Difficulty.MEDIUM, 5);

            // Database questions
            createQuestion(c2, "SQL中用于查询数据的关键字是？",
                    "[\"A. INSERT\", \"B. SELECT\", \"C. UPDATE\", \"D. DELETE\"]",
                    "B", Question.QuestionType.SINGLE_CHOICE, Question.Difficulty.EASY, 5);
            createQuestion(c2, "以下哪些是SQL的聚合函数？",
                    "[\"A. COUNT\", \"B. SUM\", \"C. JOIN\", \"D. AVG\"]",
                    "A,B,D", Question.QuestionType.MULTI_CHOICE, Question.Difficulty.MEDIUM, 10);
            createQuestion(c2, "数据库事务的ACID特性中，A代表的是？",
                    "[\"A. 可用性(Availability)\", \"B. 原子性(Atomicity)\", \"C. 自动性(Automatic)\", \"D. 异步性(Asynchronous)\"]",
                    "B", Question.QuestionType.SINGLE_CHOICE, Question.Difficulty.MEDIUM, 5);
            createQuestion(c2, "索引可以提高数据库的查询性能。",
                    "[\"A. 正确\", \"B. 错误\"]",
                    "A", Question.QuestionType.TRUE_FALSE, Question.Difficulty.EASY, 5);

            // Frontend questions
            createQuestion(c3, "HTML中用于定义段落的标签是？",
                    "[\"A. <div>\", \"B. <span>\", \"C. <p>\", \"D. <br>\"]",
                    "C", Question.QuestionType.SINGLE_CHOICE, Question.Difficulty.EASY, 5);
            createQuestion(c3, "CSS中哪个属性用于设置字体大小？",
                    "[\"A. font-weight\", \"B. font-size\", \"C. text-size\", \"D. font-style\"]",
                    "B", Question.QuestionType.SINGLE_CHOICE, Question.Difficulty.EASY, 5);
            createQuestion(c3, "JavaScript中以下哪些是声明变量的方式？",
                    "[\"A. var\", \"B. let\", \"C. const\", \"D. int\"]",
                    "A,B,C", Question.QuestionType.MULTI_CHOICE, Question.Difficulty.MEDIUM, 10);
            createQuestion(c3, "React是一个用于构建用户界面的JavaScript库。",
                    "[\"A. 正确\", \"B. 错误\"]",
                    "A", Question.QuestionType.TRUE_FALSE, Question.Difficulty.EASY, 5);

            // Create sample papers
            Paper paper1 = new Paper();
            paper1.setTitle("Java基础测试");
            paper1.setCategory(c1);
            paper1.setDuration(30);
            paper1.setDescription("Java编程语言基础知识考核");
            paper1.setTotalScore(0);
            paperRepository.save(paper1);

            // Add questions to paper1
            int order = 1;
            int total = 0;
            for (Question q : questionRepository.findByCategoryId(c1.getId())) {
                PaperQuestion pq = new PaperQuestion();
                pq.setPaper(paper1);
                pq.setQuestion(q);
                pq.setOrderNum(order++);
                pq.setScore(q.getScore());
                paper1.getPaperQuestions().add(pq);
                total += q.getScore();
            }
            paper1.setTotalScore(total);
            paperRepository.save(paper1);

            Paper paper2 = new Paper();
            paper2.setTitle("综合能力测试");
            paper2.setCategory(c2);
            paper2.setDuration(60);
            paper2.setDescription("数据库与前端综合知识考核");
            paper2.setTotalScore(0);
            paperRepository.save(paper2);

            order = 1;
            total = 0;
            for (Question q : questionRepository.findByCategoryId(c2.getId())) {
                PaperQuestion pq = new PaperQuestion();
                pq.setPaper(paper2);
                pq.setQuestion(q);
                pq.setOrderNum(order++);
                pq.setScore(q.getScore());
                paper2.getPaperQuestions().add(pq);
                total += q.getScore();
            }
            for (Question q : questionRepository.findByCategoryId(c3.getId())) {
                PaperQuestion pq = new PaperQuestion();
                pq.setPaper(paper2);
                pq.setQuestion(q);
                pq.setOrderNum(order++);
                pq.setScore(q.getScore());
                paper2.getPaperQuestions().add(pq);
                total += q.getScore();
            }
            paper2.setTotalScore(total);
            paperRepository.save(paper2);
        }
    }

    private void createQuestion(Category category, String content, String options,
                                 String answer, Question.QuestionType type,
                                 Question.Difficulty difficulty, int score) {
        Question q = new Question();
        q.setCategory(category);
        q.setContent(content);
        q.setOptions(options);
        q.setAnswer(answer);
        q.setType(type);
        q.setDifficulty(difficulty);
        q.setScore(score);
        questionRepository.save(q);
    }
}
