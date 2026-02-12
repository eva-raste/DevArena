import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchQuestionCard,
  submitCode,
  runCode,
  fetchMySubmissions,
  saveDraft,
  fetchDraft,
} from "../../apis/question-api";
import * as monaco from "monaco-editor";
import { useThemeStore } from "@/store/useThemeStore";
import getDifficultyColor from "../helpers/colorDifficulty";
import { VERDICT_STYLES } from "../helpers/colorVerdict";

const MAX_TESTCASES = 6;

const QuestionSolve = () => {
  const { roomId, slug } = useParams();
  const [question, setQuestion] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [error, setError] = useState(null);
  const [customTestcases, setCustomTestcases] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [selectedCase, setSelectedCase] = useState(1);
  const [verdict, setVerdict] = useState(null);
  const [passedCount, setPassedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [mySubmissions, setMySubmissions] = useState([]);

  const editorRef = useRef(null);
  const monacoEditor = useRef(null);
  const lastSavedRef = useRef("");

  const isDark = useThemeStore((s) => s.isDark);

  const fallbackTemplates = {
    c: `#include <stdio.h>\n\nint main() {\n    return 0;\n}`,
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}`,
  };

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        const data = await fetchQuestionCard(slug);
        setQuestion(data);
      } catch {
        setError("Question not found");
      }
    };
    loadQuestion();
  }, [slug]);

  const loadInitialCode = async () => {
    if (!question) return fallbackTemplates[language];

    try {
      const code = await fetchDraft({
        questionSlug: question.questionSlug,
        language,
        roomId: roomId ?? null,
      });

      if (code) return code;

      return question.codeMap?.[language] || fallbackTemplates[language];
    } catch (err) {
      console.error("Error loading draft:", err);
      return question.codeMap?.[language] || fallbackTemplates[language];
    }
  };

  useEffect(() => {
    if (!editorRef.current || monacoEditor.current || !question) return;

    monacoEditor.current = monaco.editor.create(editorRef.current, {
      value: fallbackTemplates[language],
      language,
      theme: isDark ? "vs-dark" : "vs-light",
      automaticLayout: true,
      minimap: { enabled: false },
    });

    return () => {
      monacoEditor.current?.dispose();
      monacoEditor.current = null;
    };
  }, [question]);

    useEffect(() => {
      if (!monacoEditor.current || !question) return;

      const load = async () => {
        const code = await loadInitialCode();
        monacoEditor.current.setValue(code);
        lastSavedRef.current = code;
      };

      load();
    }, [monacoEditor.current, question, language, roomId]);

  useEffect(() => {
    if (!monacoEditor.current || !question) return;

    let timer;

    const disposable = monacoEditor.current.onDidChangeModelContent(() => {
      const currentCode = monacoEditor.current.getValue();

      clearTimeout(timer);

      timer = setTimeout(async () => {
        if (currentCode === lastSavedRef.current) return;

        try {
          await saveDraft({
            questionSlug: question.questionSlug,
            roomId: roomId ?? null,
            language,
            code: currentCode,
          });

          lastSavedRef.current = currentCode;
        } catch (err) {
          console.error("Auto-save failed:", err);
        }
      }, 15000);
    });

    return () => {
      clearTimeout(timer);
      disposable.dispose();
    };
  }, [question, language, roomId]);

  useEffect(() => {
    if (!monacoEditor.current) return;
    monaco.editor.setTheme(isDark ? "vs-dark" : "vs-light");
  }, [isDark]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden") {
        const code = monacoEditor.current?.getValue();
        if (!code || !question || code === lastSavedRef.current) return;

        try {
          await saveDraft({
            questionSlug: question.questionSlug,
            roomId: roomId ?? null,
            language,
            code,
          });

          lastSavedRef.current = code;
        } catch (err) {
          console.error("Save on tab switch failed:", err);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [question, language, roomId]);

  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      const code = monacoEditor.current?.getValue();
      if (!code || !question || code === lastSavedRef.current) return;

      try {
        await saveDraft({
          questionSlug: question.questionSlug,
          roomId: roomId ?? null,
          language,
          code,
        });

        lastSavedRef.current = code;
      } catch (err) {
        console.error("Save on page reload failed:", err);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [question, language, roomId]);

  const allCases = [
    ...(question?.sampleTestcases || []).map((tc, i) => ({
      caseNumber: i + 1,
      input: tc.input,
      expected: tc.output,
      isCustom: false,
    })),
    ...customTestcases.map((tc, i) => ({
      caseNumber: (question?.sampleTestcases?.length || 0) + i + 1,
      input: tc.input,
      expected: "-",
      isCustom: true,
      customIndex: i,
    })),
  ];

  const handleAddTestcase = () => {
    if (!question?.sampleTestcases?.length) return;
    if (allCases.length >= MAX_TESTCASES) return;
    setCustomTestcases((prev) => [
      ...prev,
      { input: question.sampleTestcases[0].input },
    ]);
    setSelectedCase(allCases.length + 1);
  };

  const handleDeleteCustom = (customIndex) => {
    setCustomTestcases((prev) => prev.filter((_, i) => i !== customIndex));
    setSelectedCase(1);
    setTestResults([]);
  };

  const handleRun = async () => {
    setVerdict(null);
    setTestResults([]);

    const code = monacoEditor.current.getValue();

    if (code !== lastSavedRef.current) {
      try {
        await saveDraft({
          questionSlug: question.questionSlug,
          roomId: roomId ?? null,
          language,
          code,
        });
        lastSavedRef.current = code;
      } catch (err) {
        console.error("Save on run failed:", err);
      }
    }

    const data = await runCode(
      code,
      allCases.map((tc) => tc.input)
    );

    const results = data.results.map((r, i) => ({
      caseNumber: i + 1,
      stdout: r.stdout?.trim() || "",
      stderr: r.stderr?.trim() || "",
    }));

    setTestResults(results);
  };

  const handleSubmit = async () => {
    if (!question || !monacoEditor.current) return;

    setVerdict(null);
    const code = monacoEditor.current.getValue();

    if (code !== lastSavedRef.current) {
      try {
        await saveDraft({
          questionSlug: question.questionSlug,
          roomId: roomId ?? null,
          language,
          code,
        });
        lastSavedRef.current = code;
      } catch (err) {
        console.error("Save on submit failed:", err);
      }
    }

    const submitCases = [
      ...(question.sampleTestcases ?? []),
      ...(question.hiddenTestcases ?? []),
    ];

    const data = await submitCode(
      question.questionSlug,
      roomId ?? null,
      code,
      submitCases.map((tc) => tc.input)
    );

    setVerdict(data.verdict);
    setPassedCount(data.verdict === "ACCEPTED" ? submitCases.length : 0);
    setTotalCount(submitCases.length);
  };

  const loadMySubmissions = async () => {
    if (!question) return;
    const data = await fetchMySubmissions(question.questionSlug, roomId ?? null);
    setMySubmissions(data);
  };

  if (!question && !error) return <div>Loading...</div>;
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  const currentCase = allCases.find((c) => c.caseNumber === selectedCase);
  const currentResult = testResults.find((r) => r.caseNumber === selectedCase);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-1/2 border-r border-border overflow-y-auto p-6">
        <h1 className="text-3xl font-bold mb-2">{question.title}</h1>

        <button
          onClick={() => {
            setShowSubmissions((prev) => !prev);
            if (!showSubmissions) loadMySubmissions();
          }}
          className="mb-4 px-3 py-1 text-sm border rounded hover:bg-muted"
        >
          My Submissions
        </button>

        {showSubmissions && (
          <div className="mb-4 border border-border rounded p-4 bg-card">
            {mySubmissions.length === 0 ? (
              <div className="text-muted-foreground">No submissions yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Time</th>
                    <th className="text-left py-2">Verdict</th>
                    <th className="text-left py-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {mySubmissions.map((s) => (
                    <tr key={s.id} className="border-b border-border">
                      <td className="py-2">
                        {new Date(s.submittedAt).toLocaleString()}
                      </td>
                      <td className="py-2">
                        {s.verdict.replaceAll("_", " ")}
                      </td>
                      <td className="py-2">{s.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <span
            className={`px-2 py-1 rounded text-sm font-semibold ${getDifficultyColor(
              question.difficulty
            )}`}
          >
            {question.difficulty}
          </span>
          <span className="px-2 py-1 rounded text-sm bg-muted">
            {question.score || 0} pts
          </span>
        </div>

        <div className="prose prose-sm max-w-none">
          <p>{question.description}</p>
        </div>

        {question.sampleTestcases && question.sampleTestcases.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Sample Testcases</h3>
            {question.sampleTestcases.map((tc, idx) => (
              <div key={idx} className="mb-4 border border-border rounded p-4 bg-card">
                <div className="font-semibold mb-2">Example {idx + 1}:</div>
                <div className="mb-2">
                  <div className="text-sm text-muted-foreground mb-1">Input:</div>
                  <pre className="bg-background p-2 rounded text-sm overflow-x-auto">
                    {tc.input}
                  </pre>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Output:</div>
                  <pre className="bg-background p-2 rounded text-sm overflow-x-auto">
                    {tc.output}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}

        {question.constraints && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Constraints</h3>
            <div className="border border-border rounded p-4 bg-card">
              <pre className="text-sm whitespace-pre-wrap">{question.constraints}</pre>
            </div>
          </div>
        )}
      </div>

      <div className="w-1/2 flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            Language:
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-card text-foreground p-2 rounded border border-border ml-2"
            >
              <option value="c">C</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRun}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Run
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Submit
            </button>
          </div>
        </div>

        {verdict && (
          <div
            className={`p-3 text-sm font-semibold ${
              VERDICT_STYLES[verdict] || "bg-muted"
            }`}
          >
            {verdict} — Passed {passedCount} / {totalCount} testcases
          </div>
        )}

        <div ref={editorRef} className="flex-1" />

        <div className="border-t border-border p-4">
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {allCases.map((tc) => (
              <div key={tc.caseNumber} className="relative">
                <button
                  onClick={() => setSelectedCase(tc.caseNumber)}
                  className={`px-3 py-1 rounded font-semibold border transition ${
                    selectedCase === tc.caseNumber
                      ? "bg-muted border-primary text-foreground"
                      : "bg-card border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Case {tc.caseNumber}
                </button>
                {tc.isCustom && (
                  <button
                    onClick={() => handleDeleteCustom(tc.customIndex)}
                    className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddTestcase}
              disabled={allCases.length >= MAX_TESTCASES}
              className="px-3 py-1 rounded font-semibold border bg-card border-border hover:bg-muted disabled:opacity-40"
            >
              +
            </button>
          </div>

          {currentCase && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">Input</div>
              {currentCase.isCustom ? (
                <textarea
                  value={currentCase.input}
                  onChange={(e) =>
                    setCustomTestcases((prev) =>
                      prev.map((c, i) =>
                        i === currentCase.customIndex
                          ? { ...c, input: e.target.value }
                          : c
                      )
                    )
                  }
                  className="bg-background p-2 rounded w-full border border-border text-foreground resize-y"
                />
              ) : (
                <pre className="bg-background p-2 rounded overflow-x-auto text-sm text-foreground">
                  {currentCase.input}
                </pre>
              )}

              <div className="text-sm text-muted-foreground mt-3">Output</div>
              <pre
                className={`bg-background p-2 rounded overflow-x-auto text-sm ${
                  currentResult?.stderr ? "text-destructive" : "text-foreground"
                }`}
              >
                {currentResult?.stderr
                  ? currentResult.stderr
                  : currentResult?.stdout || ""}
              </pre>

              <div className="text-sm text-muted-foreground mt-3">Expected</div>
              <pre className="bg-background p-2 rounded text-primary overflow-x-auto text-sm">
                {currentCase.isCustom ? "-" : currentCase.expected}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionSolve;