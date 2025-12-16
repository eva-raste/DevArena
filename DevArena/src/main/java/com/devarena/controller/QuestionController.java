package com.devarena.controller;

import com.devarena.dtos.QuestionCreateDto;
import com.devarena.service.IQuesitonService;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questions")
@Data
public class QuestionController {
    private final IQuesitonService questionService;

    @PostMapping
    public ResponseEntity<QuestionCreateDto> createQuestion(@RequestBody QuestionCreateDto question) throws Exception {

        System.out.println("Request for " + question);

        if(questionService.existsByQuestionSlug(question.getQuestionSlug()))
        {
            throw new Exception("Question with this slug already exists");
        }

        QuestionCreateDto q = questionService.createQuestion(question);
        System.out.println("Returning " + q);
        return ResponseEntity.status(HttpStatus.CREATED).body(q);
    }
    @GetMapping("/all")
    public ResponseEntity<Iterable<QuestionCreateDto>> getAllQuestions()
    {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }
}
