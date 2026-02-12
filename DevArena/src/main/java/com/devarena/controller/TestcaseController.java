package com.devarena.controller;

import com.devarena.dtos.questions.Testcase;
import com.devarena.service.TestcaseParseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/testcases")
@RequiredArgsConstructor
public class TestcaseController {

    private final TestcaseParseService testcaseParseService;

    @PostMapping("/parse-zip")
    public List<Testcase> parseZip(
            @RequestParam("file") MultipartFile zipFile
    ) {
        return testcaseParseService.parse(zipFile);
    }
}

