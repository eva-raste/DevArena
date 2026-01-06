package com.devarena.ingestion;

import com.devarena.ingestion.dto.IngestExampleDto;
import com.devarena.ingestion.dto.IngestQuestionDto;
import com.devarena.models.Question;
import com.devarena.models.QuestionDifficulty;
import com.devarena.models.Testcase;

import java.util.List;
import java.util.stream.Collectors;

public class IngestQuestionMapper {

    private IngestQuestionMapper() {
        // utility class
    }

    public static Question toEntity(IngestQuestionDto dto) {
        Question q = new Question();

        // Core fields
        q.setQuestionSlug(dto.getSlug());
        q.setTitle(dto.getTitle());
        q.setDescription(dto.getDescription());
        q.setConstraints(dto.getConstraints());

        // Difficulty mapping
        q.setDifficulty(mapDifficulty(dto.getRating()));

        // Examples → sample testcases
        if (dto.getExamples() != null && !dto.getExamples().isEmpty()) {
            List<Testcase> testcases =
                    dto.getExamples().stream()
                            .map(IngestQuestionMapper::mapExample)
                            .collect(Collectors.toList());

            q.setSampleTestcases(testcases);
        }

        return q;
    }

    private static Testcase mapExample(IngestExampleDto ex) {
        Testcase tc = new Testcase();
        tc.setInput(ex.getInput());
        tc.setOutput(ex.getOutput());
        return tc;
    }

    private static QuestionDifficulty mapDifficulty(Integer rating) {
        if (rating == null) {
            return QuestionDifficulty.MEDIUM;
        }
        if (rating <= 1000) {
            return QuestionDifficulty.EASY;
        }
        if (rating <= 1400) {
            return QuestionDifficulty.MEDIUM;
        }
        return QuestionDifficulty.HARD;
    }
}
