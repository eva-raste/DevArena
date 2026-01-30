package com.devarena.mappers;



import com.devarena.dtos.questions.CodeforcesQuestionPrefillDto;
import com.devarena.dtos.questions.ExampleDto;
import com.devarena.dtos.questions.QuestionCreateDto;
import com.devarena.models.Testcase;
import com.devarena.repositories.IQuestionRepo;
import lombok.Data;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@Data
public class CodeforcesPrefillMapper {
    private final IQuestionRepo questionRepo;
    public QuestionCreateDto toQuestionCreateDto(
            CodeforcesQuestionPrefillDto source,
            String displayName) {
        QuestionCreateDto dto = new QuestionCreateDto();
        String slug = (displayName.replace(" ","-") + "-" + source.getSlug()).replace("/", "-");
        slug = generateUniqueSlug(slug);
        // fields dataset CAN provide
        dto.setQuestionSlug(slug);

        dto.setTitle(source.getTitle());
        dto.setDescription(source.getDescription());

        // map examples → sample testcases
        if (source.getExamples() != null) {
            List<Testcase> sample =
                    source.getExamples()
                            .stream()
                            .map(this::toTestcase)
                            .collect(Collectors.toList());

            dto.setSampleTestcases(sample);
        }

        // fields dataset MUST NOT decide
        dto.setDifficulty(null);
        dto.setScore(null);
        dto.setConstraints(null);
        dto.setHiddenTestcases(null);
//        dto.setQuestionId(null);

        return dto;
    }


    public String generateUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 2;

        while (questionRepo.existsByQuestionSlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        return slug;
    }

    private Testcase toTestcase(ExampleDto ex) {
        Testcase tc = new Testcase();
        tc.setInput(ex.getInput());
        tc.setOutput(ex.getOutput());
        return tc;
    }
}

