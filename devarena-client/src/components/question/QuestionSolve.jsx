import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchQuestionCard, runCode } from "../../apis/question-api";
import * as monaco from "monaco-editor";
import { useThemeStore } from "@/store/useThemeStore";
import getDifficultyColor from "../helpers/colorDifficulty";
const MAX_TESTCASES = 6;

const QuestionSolve = () => {
  const { slug } = useParams();

  const [question, setQuestion] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [error, setError] = useState(null);

  const [customTestcases, setCustomTestcases] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [selectedCase, setSelectedCase] = useState(1);

  const [verdict, setVerdict] = useState(null);
  const [passedCount, setPassedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const editorRef = useRef(null);
  const monacoEditor = useRef(null);

  const langMap = { c: "c", cpp: "cpp" };
const isDark = useThemeStore((s) => s.isDark)

  const fallbackTemplates = {
    c: `#include <stdio.h>
int main() {
    return 0;
}`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    return 0;
}`,
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

  useEffect(() => {
    if (!editorRef.current || !question) return;

    monacoEditor.current = monaco.editor.create(editorRef.current, {
      value: question.codeMap?.[language] || fallbackTemplates[language],
      language: langMap[language],
      automaticLayout: true,
    });

    return () => monacoEditor.current?.dispose();
  }, [question]);

  useEffect(() => {
    if (!monacoEditor.current) return;

    monaco.editor.setTheme(isDark ? "vs-dark" : "vs-light");
  }, [isDark]);


  useEffect(() => {
    if (!monacoEditor.current || !question) return;

    const model = monaco.editor.createModel(
      question.codeMap?.[language] || fallbackTemplates[language],
      langMap[language]
    );

    monacoEditor.current.setModel(model);
  }, [language]);

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

    const userCode = monacoEditor.current.getValue();

    const data = await runCode(
      userCode,
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
    setVerdict(null);

    const userCode = monacoEditor.current.getValue();

    const submitCases = [
      ...(question.sampleTestcases || []),
      ...(question.hiddenTestcases || []),
    ];

    const data = await runCode(
      userCode,
      submitCases.map((tc) => tc.input)
    );

    let passed = 0;

    data.results.forEach((res, i) => {
      const actual = res.stdout?.trim() || "";
      const expected = submitCases[i].output?.trim() || "";

      if (!res.stderr && actual === expected) {
        passed++;
      }
    });

    setPassedCount(passed);
    setTotalCount(submitCases.length);
    setVerdict(passed === submitCases.length ? "Accepted" : "Wrong Answer");
  };
if (!question && !error)
  return <div className="min-h-screen bg-background" />

if (error) {
  return (
    <div className="min-h-screen flex items-center justify-center text-destructive bg-background">
      {error}
    </div>
  )
}

const currentCase = allCases.find((c) => c.caseNumber === selectedCase)
const currentResult = testResults.find(
  (r) => r.caseNumber === selectedCase
)

return (
  <div className="min-h-screen bg-background text-foreground px-6 py-8 md:px-10">
    <h1 className="text-3xl font-bold mb-2">{question.title}</h1>

    <div className="flex gap-4 text-sm text-muted-foreground mb-6">
      <span className={`${getDifficultyColor(question.difficulty)} px-3 py-1 bg-card border border-border rounded text-xs font-semibold text-foreground`}>
        {question.difficulty}
      </span>
      <span>{question.score || 0} pts</span>
    </div>

    <div className="bg-card rounded-xl p-6 mb-6 border border-border">
      <p className="whitespace-pre-line text-foreground/90 leading-relaxed">
        {question.description}
      </p>
    </div>

    {/* Language */}
    <div className="mb-4">
      <label className="mr-2 text-foreground/80">Language:</label>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-card text-foreground p-2 rounded border border-border focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="c">C</option>
        <option value="cpp">C++</option>
      </select>
    </div>

    <div
      ref={editorRef}
      className="border border-border rounded overflow-hidden mb-4"
      style={{ height: "400px" }}
    />

    <div className="mt-4 flex gap-4">
      <button
        onClick={handleRun}
        className="px-6 py-2 bg-accent hover:bg-accent/90 text-accent-foreground transition rounded font-semibold"
      >
        Run
      </button>

      <button
        onClick={handleSubmit}
        className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground transition rounded font-semibold"
      >
        Submit
      </button>
    </div>

    {verdict && (
      <div
        className={`mt-6 text-lg font-semibold ${
          verdict === "Accepted"
            ? "text-primary"
            : "text-destructive"
        }`}
      >
        {verdict} — Passed {passedCount} / {totalCount} testcases
      </div>
    )}

    {/* ---------- CASES ---------- */}
    <div className="mt-6 bg-card p-4 rounded border border-border">
      <div className="flex gap-2 mb-4 flex-wrap">
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
        <div className="border-t border-border pt-4">
          <div className="text-sm text-muted-foreground mb-1">
            Input
          </div>

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

          <div className="text-sm text-muted-foreground mt-3">
            Output
          </div>
          <pre
            className={`bg-background p-2 rounded overflow-x-auto text-sm ${
              currentResult?.stderr
                ? "text-destructive"
                : "text-foreground"
            }`}
          >
            {currentResult?.stderr
              ? currentResult.stderr
              : currentResult?.stdout || ""}
          </pre>

          <div className="text-sm text-muted-foreground mt-3">
            Expected
          </div>
          <pre className="bg-background p-2 rounded text-primary overflow-x-auto text-sm">
            {currentCase.isCustom ? "-" : currentCase.expected}
          </pre>
        </div>
      )}
    </div>
  </div>
)


};

export default QuestionSolve;
