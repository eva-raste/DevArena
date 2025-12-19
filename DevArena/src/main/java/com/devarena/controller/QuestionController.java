package com.devarena.controller;

import com.devarena.dtos.QuestionCreateDto;
import com.devarena.dtos.QuestionDto;
import com.devarena.service.IQuesitonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class QuestionController {

    private final IQuesitonService questionService;

    @PostMapping
    public ResponseEntity<QuestionCreateDto> createQuestion(@Valid @RequestBody QuestionCreateDto question) {

        if (questionService.existsByQuestionSlug(question.getQuestionSlug())) {
            return ResponseEntity
                    .status(409)
                    .body(null);
        }

        QuestionCreateDto created = questionService.createQuestion(question);
        return ResponseEntity
                .ok(created);
    }

    @GetMapping
    public ResponseEntity<Iterable<QuestionDto>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }

    @GetMapping(value="/{slug}",produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<QuestionDto> findByQuestionSlug(@PathVariable("slug") String slug)
    {
        return ResponseEntity.ok(questionService.findByQuestionSlug(slug));
    }

}
