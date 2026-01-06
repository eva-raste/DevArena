package com.devarena.service;

import com.devarena.dtos.QuestionCardDto;
import com.devarena.dtos.QuestionCreateDto;
import com.devarena.dtos.QuestionDto;
import com.devarena.models.Question;
import com.devarena.models.User;
import com.devarena.repositories.IQuestionRepo;
import com.devarena.service.interfaces.IQuesitonService;
import jakarta.transaction.Transactional;
import lombok.Data;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

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

    public Iterable<QuestionDto> getAllQuestions()
    {
        return questionRepo.findAll()
                .stream().map(
                        (Question q) -> modelMapper.map(q,QuestionDto.class)
                )
        .toList();

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
        List<Question> qu = questionRepo.findAllByOwner(owner);
        return qu.stream().map(
                q -> modelMapper.map(q,QuestionDto.class)
        ).toList();
    }

}
