package com.capstone.repository;

import com.capstone.entity.Answer;
import com.capstone.entity.Question;
import com.capstone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, String> {
    List<Answer> findByQuestionOrderByCreatedAtDesc(Question question);
    List<Answer> findByUserOrderByCreatedAtDesc(User user);
    List<Answer> findByUserAndCreatedAtAfter(User user, LocalDateTime date);
    Optional<Answer> findByUserAndQuestion(User user, Question question);
} 