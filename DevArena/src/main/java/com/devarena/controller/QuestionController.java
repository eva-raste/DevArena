package com.devarena.controller;

import com.devarena.dtos.questions.CodeforcesQuestionPrefillDto;
import com.devarena.dtos.questions.QuestionCardDto;
import com.devarena.dtos.questions.QuestionCreateDto;
import com.devarena.dtos.questions.QuestionDto;
import com.devarena.exception.DuplicateQuestionSlugException;
import com.devarena.mappers.CodeforcesPrefillMapper;
import com.devarena.models.QuestionDifficulty;
import com.devarena.models.User;
import com.devarena.service.CodeforcesDatasetService;
import com.devarena.service.interfaces.IQuesitonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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
    public ResponseEntity<Page<QuestionDto>> getAllQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort,
            @RequestParam(required = false) QuestionDifficulty difficulty,
            @AuthenticationPrincipal User owner
    ) {
        Sort sortObj = Sort.by(
                sort.endsWith(",desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                sort.split(",")[0]
        );

        Pageable pageable = PageRequest.of(page, size, sortObj);

        return ResponseEntity.ok(
                questionService.getAllQuestions(pageable, owner.getUserId(), difficulty));


    }


    @GetMapping(value="/{slug}",produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<QuestionDto> findByQuestionSlug(@PathVariable("slug") String slug,@AuthenticationPrincipal User currentUser
    )
    {
        return ResponseEntity.ok(questionService.findByQuestionSlug(slug,currentUser));
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
//        System.out.println("CF question response " + dto);
        return ResponseEntity.ok(dto);
    }

    // UPDATE
    @PutMapping
    public ResponseEntity<QuestionDto> updateQuestion(
            @RequestParam(name = "questionSlug") String questionSlug,
            @RequestBody @Valid QuestionDto dto,
            @AuthenticationPrincipal User currentUser
    ) {
        QuestionDto updated = questionService.updateQuestion(questionSlug,dto,currentUser);
        return ResponseEntity.ok(updated);
    }

    // DELETE (soft delete)
    @DeleteMapping
    public ResponseEntity<Void> deleteQuestion(@RequestParam("questionSlug") String questionSlug,@AuthenticationPrincipal User currentUser) {

        boolean deleted = questionService.deleteQuestion(questionSlug,currentUser);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{slug}/modifiers")
    public void updateModifiers(
            @PathVariable String slug,
            @RequestBody List<UUID> modifierIds,
            @AuthenticationPrincipal User currentUser
    ) {
        questionService.updateModifiers(slug, modifierIds, currentUser);
    }

}
