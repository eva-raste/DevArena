package com.devarena.mappers;



import com.devarena.dtos.CodeforcesQuestionPrefillDto;
import com.devarena.dtos.ExampleDto;
import com.devarena.dtos.QuestionCreateDto;
import com.devarena.models.Testcase;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CodeforcesPrefillMapper {

    public QuestionCreateDto toQuestionCreateDto(
            CodeforcesQuestionPrefillDto source,
            String displayName) {
        QuestionCreateDto dto = new QuestionCreateDto();

        // fields dataset CAN provide
        dto.setQuestionSlug(
                (displayName + "-" + source.getSlug()).replace("/", "-")
        );

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
        dto.setQuestionId(null);

        return dto;
    }

    private Testcase toTestcase(ExampleDto ex) {
        Testcase tc = new Testcase();
        tc.setInput(ex.getInput());
        tc.setOutput(ex.getOutput());
        return tc;
    }
}

