import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchQuestionCard, runCode } from "../../apis/question-api";
import * as monaco from "monaco-editor";

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
      theme: "vs-dark",
      automaticLayout: true,
    });

    return () => monacoEditor.current?.dispose();
  }, [question]);

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


  if (!question && !error) return <div className="min-h-screen bg-gray-900" />;

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  const currentCase = allCases.find((c) => c.caseNumber === selectedCase);
  const currentResult = testResults.find(
    (r) => r.caseNumber === selectedCase
  );


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">

      <h1 className="text-3xl font-bold mb-2">{question.title}</h1>

      <div className="flex gap-4 text-sm text-gray-400 mb-6">
        <span className="px-3 py-1 bg-gray-800 rounded">
          {question.difficulty}
        </span>
        <span>{question.score || 0} pts</span>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <p className="whitespace-pre-line text-gray-300">
          {question.description}
        </p>
      </div>

      {/* Language */}
      <div className="mb-3">
        <label className="mr-2">Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-800 p-2 rounded"
        >
          <option value="c">C</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <div ref={editorRef} className="border border-gray-700 rounded" style={{ height: "400px" }} />

      <div className="mt-4 flex gap-4">
        <button
          onClick={handleRun}
          className="px-6 py-2 bg-teal-500 hover:bg-teal-600 rounded font-semibold"
        >
          Run
        </button>

        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded font-semibold"
        >
          Submit
        </button>
      </div>

      {verdict && (
        <div
          className={`mt-4 text-lg font-semibold ${
            verdict === "Accepted" ? "text-green-400" : "text-red-400"
          }`}
        >
          {verdict} — Passed {passedCount} / {totalCount} testcases
        </div>
      )}

      {/* ---------- CASES ---------- */}
      <div className="mt-6 bg-gray-800 p-4 rounded">

        <div className="flex gap-2 mb-4">
          {allCases.map((tc) => (
            <div key={tc.caseNumber} className="relative">
              <button
                onClick={() => setSelectedCase(tc.caseNumber)}
                className={`px-3 py-1 rounded font-semibold border ${
                  selectedCase === tc.caseNumber
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-800 border-gray-600"
                }`}
              >
                Case {tc.caseNumber}
              </button>

              {tc.isCustom && (
                <button
                  onClick={() => handleDeleteCustom(tc.customIndex)}
                  className="absolute -top-2 -right-2 text-xs text-white rounded-full px-2"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button
            onClick={handleAddTestcase}
            disabled={allCases.length >= MAX_TESTCASES}
            className="px-3 py-1 rounded font-semibold border bg-gray-800 border-gray-600 hover:bg-gray-700 disabled:opacity-40"
          >
            +
          </button>
        </div>

        {currentCase && (
          <div className="border-t border-gray-700 pt-3">
            <div className="text-sm text-gray-400 mb-1">Input</div>

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
                className="bg-gray-900 p-2 rounded w-full"
              />
            ) : (
              <pre className="bg-gray-900 p-2 rounded">
                {currentCase.input}
              </pre>
            )}

            <div className="text-sm text-gray-400 mt-2">Output</div>
            <pre
              className={`bg-gray-900 p-2 rounded ${
                currentResult?.stderr ? "text-red-400" : "text-gray-100"
              }`}
            >
              {currentResult?.stderr
                ? currentResult.stderr
                : currentResult?.stdout || ""}
            </pre>

            <div className="text-sm text-gray-400 mt-2">Expected</div>
            <pre className="bg-gray-900 p-2 rounded text-green-400">
              {currentCase.isCustom ? "-" : currentCase.expected}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionSolve;
