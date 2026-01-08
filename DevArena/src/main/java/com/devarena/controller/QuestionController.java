package com.devarena.controller;

import com.devarena.dtos.CodeforcesQuestionPrefillDto;
import com.devarena.dtos.QuestionCardDto;
import com.devarena.dtos.QuestionCreateDto;
import com.devarena.dtos.QuestionDto;
import com.devarena.exception.DuplicateQuestionSlugException;
import com.devarena.helper.CodeforcesDatasetLoader;
import com.devarena.mappers.CodeforcesPrefillMapper;
import com.devarena.models.User;
import com.devarena.service.CodeforcesDatasetService;
import com.devarena.service.interfaces.IQuesitonService;
import jakarta.persistence.Basic;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class QuestionController {

    private final IQuesitonService questionService;
    private final CodeforcesPrefillMapper prefillMapper;
    private final CodeforcesDatasetService codeforcesDatasetService;

    @PostMapping
    public ResponseEntity<QuestionCreateDto> createQuestion(@Valid @RequestBody QuestionCreateDto question,
                                                            @AuthenticationPrincipal User owner) {

        // if same slug exists in db
        if (questionService.existsByQuestionSlug(question.getQuestionSlug())) {
            throw new DuplicateQuestionSlugException("Duplicate QuestionSlug");
        }

        QuestionCreateDto created = questionService.createQuestion(question,owner);
        return ResponseEntity
                .ok(created);
    }

    @GetMapping
    public ResponseEntity<Iterable<QuestionDto>> getAllQuestions(@AuthenticationPrincipal User owner) {
        return ResponseEntity.ok(questionService.getAllQuestionsByUser(owner));
    }

    @GetMapping(value="/{slug}",produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<QuestionDto> findByQuestionSlug(@PathVariable("slug") String slug)
    {
        return ResponseEntity.ok(questionService.findByQuestionSlug(slug));
    }

    @GetMapping(value = "/card/{slug}",produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<QuestionCardDto> getQuestionCardByQuestionSlug
            (
                    @PathVariable("slug") String slug,
                @AuthenticationPrincipal User owner
            )
    {
        QuestionCardDto q = questionService.getCardByQuestionSlug(slug,owner);

        return ResponseEntity.ok(q);
    }


    @GetMapping("/prefill/codeforces")
    public ResponseEntity<QuestionCreateDto> prefill(
            @RequestParam("slug") String slug,
            @AuthenticationPrincipal User user
    ) {
        System.out.println("Request received on prefill " + slug);
        CodeforcesQuestionPrefillDto dataset =
                codeforcesDatasetService.fetch(slug);

        QuestionCreateDto dto =
                prefillMapper.toQuestionCreateDto(dataset,user.getDisplayName());
        System.out.println("CF question response " + dto);
        return ResponseEntity.ok(dto);
    }


}
