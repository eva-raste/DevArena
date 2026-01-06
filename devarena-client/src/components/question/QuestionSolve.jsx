import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchQuestionCard, runCode } from "../../apis/question-api";
import * as monaco from "monaco-editor";

const QuestionSolve = () => {
  const { slug } = useParams();
  var origin = "OWN";

  const [question, setQuestion] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [testResults, setTestResults] = useState([]);
  const [overallResult, setOverallResult] = useState(null);
  const [selectedCase, setSelectedCase] = useState(1); 

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
    loadQuestion();
  }, [slug]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const data = await fetchQuestionCard(slug, origin);
      origin = data.origin;
      setQuestion(data);
    } catch {
      setError("Question not found");
    } finally {
      setLoading(false);
    }
  };

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

  const handleRun = async () => {
    setTestResults([]);
    setOverallResult(null);

    const userCode = monacoEditor.current.getValue();
    const testcases = question.sampleTestcases || [];

    if (testcases.length === 0) {
      setTestResults([{ overall: "No sample testcases available" }]);
      return;
    }

    const data = await runCode(
      userCode,
      testcases.map((tc) => tc.input)
    );

    let passedAll = true;

    const results = data.results.map((r, i) => {
      const expected = testcases[i].output.trim();
      const actual = r.stdout?.trim() || "";

      const passed = actual === expected;
      if (!passed) passedAll = false;

      return {
        caseNumber: i + 1,
        passed,
        input: testcases[i].input,
        output: actual,
        expected,
        error: r.stderr?.trim() || null,
      };
    });

    setTestResults(results);
    setOverallResult(passedAll ? "Accepted" : "Wrong Answer");
    setSelectedCase(1); 
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        Loading question...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-2">{question.title}</h1>

      {/* Meta */}
      <div className="flex gap-4 text-sm text-gray-400 mb-6">
        <span className="px-3 py-1 bg-gray-800 rounded">{question.difficulty}</span>
        <span>{question.score || 0} pts</span>
      </div>

      {/* Description */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <p className="whitespace-pre-line text-gray-300">{question.description}</p>
      </div>

      {/* Language Selector */}
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

      {/* Editor */}
      <div ref={editorRef} className="border border-gray-700 rounded" style={{ height: "400px" }} />

      {/* Run Button */}
      <button
        onClick={handleRun}
        className="mt-4 px-6 py-2 bg-teal-500 hover:bg-teal-600 rounded font-semibold"
      >
        Run
      </button>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mt-6 bg-gray-800 p-4 rounded text-gray-100">
          {overallResult && (
            <div
              className={`mb-4 font-semibold text-lg ${
                overallResult === "Accepted" ? "text-green-500" : "text-red-500"
              }`}
            >
              {overallResult} — Runtime: 0 ms
            </div>
          )}

          {/* Test Case Buttons */}
          <div className="flex gap-2 mb-4">
            {testResults.map((res) => (
              <button
                key={res.caseNumber}
                onClick={() => setSelectedCase(res.caseNumber)}
                className={`px-3 py-1 rounded font-semibold border ${
                  selectedCase === res.caseNumber
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-800 border-gray-600"
                }`}
              >
                Case {res.caseNumber}{" "}
                <span className="ml-1">
                  {res.passed ? "✔" : "✖"}
                </span>
              </button>
            ))}
          </div>

          {/* Selected Case Details */}
          {selectedCase &&
            testResults
              .filter((res) => res.caseNumber === selectedCase)
              .map((res) => (
                <div key={res.caseNumber} className="mb-4 border-t border-gray-700 pt-2">
                  <div className="text-sm text-gray-400 mb-1">Input</div>
                  <pre className="bg-gray-900 p-2 rounded text-gray-100">{res.input}</pre>

                  <div className="text-sm text-gray-400 mt-2 mb-1">Output</div>
                  <pre className="bg-gray-900 p-2 rounded text-red-400">{res.output}</pre>

                  <div className="text-sm text-gray-400 mt-2 mb-1">Expected</div>
                  <pre className="bg-gray-900 p-2 rounded text-green-400">{res.expected}</pre>

                  {res.error && (
                    <>
                      <div className="text-sm text-gray-400 mt-2 mb-1">Error</div>
                      <pre className="bg-gray-900 p-2 rounded text-yellow-400">{res.error}</pre>
                    </>
                  )}
                </div>
              ))}
        </div>
      )}
    </div>
  );
};

export default QuestionSolve;
