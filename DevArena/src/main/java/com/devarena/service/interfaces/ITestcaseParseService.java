package com.devarena.service.interfaces;

import com.devarena.dtos.questions.Testcase;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ITestcaseParseService {
    List<Testcase> parse(MultipartFile zipFile);
}

