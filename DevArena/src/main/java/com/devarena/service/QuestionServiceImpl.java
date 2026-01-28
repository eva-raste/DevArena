package com.devarena.service;

import com.devarena.dtos.questions.QuestionCardDto;
import com.devarena.dtos.questions.QuestionCreateDto;
import com.devarena.dtos.questions.QuestionDto;
import com.devarena.models.Question;
import com.devarena.models.QuestionDifficulty;
import com.devarena.models.User;
import com.devarena.repositories.IQuestionRepo;
import com.devarena.service.interfaces.IQuesitonService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.Data;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@Service
@Data
public class QuestionServiceImpl implements IQuesitonService {

    private final IQuestionRepo questionRepo;
    private final ModelMapper modelMapper;
    @Override
    @Transactional
    public QuestionCreateDto createQuestion(QuestionCreateDto question, User owner) {
        if(question == null)
        {
            throw new IllegalArgumentException("Question data must not be null");
        }
        Question newquestion = modelMapper.map(question,Question.class);
        System.out.println("Saving question \n" + newquestion);

        // Owner (Many-to-One)
        newquestion.setOwner(owner);

        // Modifiers (Many-to-Many)
        newquestion.getModifiers().add(owner);

        questionRepo.save(newquestion);

        System.out.println("after save question \n" + newquestion);
        return modelMapper.map(newquestion,QuestionCreateDto.class);
    }

    public Page<QuestionDto> getAllQuestions(
            Pageable pageable,
            User owner,
            QuestionDifficulty difficulty
    ) {
        Page<Question> page;

        if (difficulty == null) {
            page = questionRepo.findAllByOwnerAndDeletedFalse(owner, pageable);
        } else {
            page = questionRepo.findAllByOwnerAndDifficultyAndDeletedFalse(
                    owner,
                    difficulty,
                    pageable
            );
        }

        return page.map(q -> modelMapper.map(q, QuestionDto.class));
    }


    @Override
    public boolean existsByQuestionSlug(String questionSlug) {
        return questionRepo.existsByQuestionSlug(questionSlug);
    }

    @Override
    public QuestionDto findByQuestionSlug(String slug) {
        return modelMapper.map(questionRepo.findByQuestionSlug(slug),QuestionDto.class);

    }

    @Override
    public QuestionDto findByQuestionSlugAndDeletedFalse(String slug) {
        return modelMapper.map(questionRepo.findByQuestionSlugAndDeletedFalse(slug),QuestionDto.class);

    }

    @Override
    public QuestionCardDto getCardByQuestionSlug(
            String slug,
            User owner) {
        Question ques = null;
                ques = questionRepo
                        .findByQuestionSlugAndOwner(slug,owner)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Question not found"
                        ));

        return modelMapper.map(ques,QuestionCardDto.class);
    }

    @Override
    public List<QuestionDto> getAllQuestionsByUser(User owner) {
        List<Question> qu = questionRepo.findAllByOwnerAndDeletedFalse(owner);
        return qu.stream().map(
                q -> modelMapper.map(q,QuestionDto.class)
        ).toList();
    }

    @Override
    @Transactional
    public QuestionDto updateQuestion(String slug,QuestionDto dto) {

        Question question = questionRepo
                .findByQuestionSlugAndDeletedFalse(slug)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Question not found or deleted: " + slug
                ));
        if(!Objects.equals(slug, dto.getQuestionSlug()) && questionRepo.existsByQuestionSlug(dto.getQuestionSlug()))
        {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "QUESTION_SLUG_ALREADY_EXISTS"
            );

        }
        question.setQuestionSlug(dto.getQuestionSlug());
        question.setTitle(dto.getTitle());
        question.setDescription(dto.getDescription());
        question.setDifficulty(dto.getDifficulty());
        question.setScore(dto.getScore());
        question.setConstraints(dto.getConstraints());

        question.getSampleTestcases().clear();
        question.getSampleTestcases().addAll(dto.getSampleTestcases());

        question.getHiddenTestcases().clear();
        question.getHiddenTestcases().addAll(dto.getHiddenTestcases());

        return modelMapper.map(question, QuestionDto.class);
    }


    @Override
    @Transactional
    public boolean deleteQuestion(String questionSlug) {

        Question question = questionRepo
                .findByQuestionSlug(questionSlug)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));

        if (question.isDeleted()) {
            return false;
        }

        question.setDeleted(true);
        return true;
    }

}
