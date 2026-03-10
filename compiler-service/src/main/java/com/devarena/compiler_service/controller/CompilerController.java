    package com.devarena.compiler_service.controller;

    import com.devarena.compiler_service.dto.CompileRequest;
    import com.devarena.compiler_service.dto.CompileResponse;
    import com.devarena.compiler_service.service.LocalCppRunnerService;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RestController
    @RequestMapping("/internal/compile")
    public class CompilerController {

        private final LocalCppRunnerService runner;

        public CompilerController(LocalCppRunnerService runner) {
            this.runner = runner;
        }

        @PostMapping
        public ResponseEntity<?> execute(
                @RequestHeader(value = "X-Internal-Token", required = false) String token,
                @RequestBody CompileRequest request
        ) {

            String expectedSecret = System.getenv("INTERNAL_SECRET");

            if (expectedSecret == null) {
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Internal secret not configured");
            }

            if (token == null || !token.equals(expectedSecret)) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized access");
            }

            if (request.getCode() == null || request.getInputs() == null) {
                return ResponseEntity
                        .badRequest()
                        .body("Missing code or inputs");
            }

            List<LocalCppRunnerService.Result> serviceResults =
                    runner.executeBatch(request.getCode(), request.getInputs());

            List<CompileResponse.Result> dtoResults =
                    serviceResults.stream()
                            .map(r -> new CompileResponse.Result(
                                    r.getStdout(),
                                    r.getStderr()
                            ))
                            .toList();

            return ResponseEntity.ok(new CompileResponse(dtoResults));
        }
    }