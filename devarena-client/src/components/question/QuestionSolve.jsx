import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchQuestionCard,submitCode, runCode, fetchMySubmissions } from "../../apis/question-api";
import * as monaco from "monaco-editor";
import { useThemeStore } from "@/store/useThemeStore";
import getDifficultyColor from "../helpers/colorDifficulty";

const MAX_TESTCASES = 6;

const QuestionSolve = () => {
  const { contestId , slug } = useParams();

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

  const langMap = { c: "c", cpp: "cpp" };
  const isDark = useThemeStore((s) => s.isDark);

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
        console.log(contestId);
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
    if (!question || !monacoEditor.current) return;

    setVerdict(null);

    const userCode = monacoEditor.current.getValue();

    const submitCases = [
      ...(question.sampleTestcases ?? []),
      ...(question.hiddenTestcases ?? []),
    ];

    const data = await submitCode(
      question.questionId,
      contestId ?? null,
      userCode,
      submitCases.map((tc) => tc.input)
    );

    setVerdict(data.verdict);
    setPassedCount(
      data.verdict === "ACCEPTED" ? submitCases.length : 0
    );
    setTotalCount(submitCases.length);
  };

  const loadMySubmissions = async () => {
    if (!question) return;
    const data = await fetchMySubmissions(question.questionId,contestId ?? null);
    setMySubmissions(data);
    console.log(data);
  };

  if (!question && !error)
    return <div className="min-h-screen bg-background" />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-destructive bg-background">
        {error}
      </div>
    );
  }

  const currentCase = allCases.find((c) => c.caseNumber === selectedCase);
  const currentResult = testResults.find(
    (r) => r.caseNumber === selectedCase
  );

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-8 md:px-10">
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
        <div className="mb-6 bg-card p-4 rounded border border-border">
          {mySubmissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No submissions yet
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left">Time</th>
                  <th className="text-left">Verdict</th>
                  <th className="text-left">Score</th>
                </tr>
              </thead>
              <tbody>
                {mySubmissions.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td>{new Date(s.submittedAt).toLocaleString()}</td>
                    <td>{s.verdict}</td>
                    <td>{s.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="flex gap-2 items-center mb-4">
        <span
          className={`px-2 py-1 rounded text-sm font-medium ${getDifficultyColor(
            question.difficulty
          )}`}
        >
          {question.difficulty}
        </span>
        <span className="text-sm text-muted-foreground">
          {question.score || 0} pts
        </span>
      </div>

      <div className="mb-6 bg-card p-4 rounded border border-border">
        {question.description}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Language:</label>
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
            className="border border-border rounded h-96"
          />

          <div className="flex gap-2 mt-4">
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

          {verdict && (
            <div
              className={`mt-4 p-3 rounded ${
                verdict === "ACCEPTED"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {verdict} — Passed {passedCount} / {totalCount} testcases
            </div>
          )}
        </div>

        <div>
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
            <div>
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
    </div>
  );
};

export default QuestionSolve;