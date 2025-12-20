package com.devarena.service;

import com.devarena.dtos.QuestionCardDto;
import com.devarena.dtos.QuestionCreateDto;
import com.devarena.dtos.QuestionDto;
import com.devarena.models.Question;
import com.devarena.models.QuestionOrigin;
import com.devarena.repositories.IQuestionRepo;
import jakarta.transaction.Transactional;
import lombok.Data;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@Data
public class QuestionServiceImpl implements IQuesitonService {

    private final IQuestionRepo questionRepo;
    private final ModelMapper modelMapper;
    @Override
    @Transactional
    public QuestionCreateDto createQuestion(QuestionCreateDto question) {
        if(question == null)
        {
            throw new NullPointerException("Question not found");
        }
        Question newquestion = modelMapper.map(question,Question.class);
        System.out.println("Saving question \n" + newquestion);
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
            QuestionOrigin questionOrigin
    ) {
        Question ques = questionRepo
                .findByQuestionSlugAndOrigin(slug, questionOrigin)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Question not found"
                ));
//        if(ques == null)
//        {
//            switch(questionOrigin)
//            {
//                case QuestionOrigin.LEETCODE -> break;
//                case QuestionOrigin.CODEFORCES -> ;
//            }
//        }
        // store q in db
        return modelMapper.map(ques,QuestionCardDto.class);
    }

}
