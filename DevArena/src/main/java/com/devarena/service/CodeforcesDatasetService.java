package com.devarena.service;

import com.devarena.dtos.CodeforcesQuestionPrefillDto;
import com.devarena.exception.DatasetNotFoundException;
import com.devarena.helper.CodeforcesDatasetLoader;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


@Service
@RequiredArgsConstructor
public class CodeforcesDatasetService {

    private final CodeforcesDatasetLoader loader;

    public CodeforcesQuestionPrefillDto fetch(String slug) {
        loader.ensureLoaded(); // blocks only if needed
        CodeforcesQuestionPrefillDto dto = loader.get(slug);

        if (dto == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Codeforces problem not found: " + slug
            );
        }

        return dto;
    }
}

