import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchQuestionCard, runCode } from "../../apis/question-api";
import * as monaco from "monaco-editor";

const QuestionSolve = () => {
  const { slug } = useParams();
  var origin = "OWN";

  const [question, setQuestion] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const editorRef = useRef(null);
  const monacoEditor = useRef(null);

  const langMap = {
    c: "c",
    cpp: "cpp",
  };

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
      console.log(data);
      origin=data.origin;
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
      value:
        question.codeMap?.[language] || fallbackTemplates[language],
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
      setOutput("⏳ Running...");

      const userCode = monacoEditor.current.getValue();
      const testcases = question.sampleTestcases || [];

      if (testcases.length === 0) {
        setOutput("No sample testcases available");
        return;
      }

      const data = await runCode(
        userCode,
        testcases.map(tc => tc.input)
      );

      let finalOutput = "";

      data.results.forEach((r, i) => {
        finalOutput += `Testcase ${i + 1}\n`;
        finalOutput += `Input:\n${testcases[i].input}\n`;

        if (r.stdout?.trim()) {
          finalOutput += `Output:\n${r.stdout}\n`;
        }

        if (r.stderr?.trim()) {
          finalOutput += `Error:\n${r.stderr}\n`;
        }

        finalOutput += "----------------------\n";
      });

      setOutput(finalOutput);


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
      <h1 className="text-3xl font-bold mb-2">
        {question.title}
      </h1>

      {/* Meta */}
      <div className="flex gap-4 text-sm text-gray-400 mb-6">
        <span className="px-3 py-1 bg-gray-800 rounded">
          {question.difficulty}
        </span>
        <span>{question.score || 0} pts</span>
      </div>

      {/* Description */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <p className="whitespace-pre-line text-gray-300">
          {question.description}
        </p>
      </div>

       {/* Static Sample Testcases */}
       {question.sampleTestcases?.length > 0 && (
         <div className="mb-8">
           <h2 className="text-xl font-semibold mb-4">
             Sample Testcases
           </h2>

           <div className="space-y-4">
             {question.sampleTestcases.map((tc, index) => (
               <div
                 key={index}
                 className="bg-gray-800 rounded-lg p-4 text-sm"
               >
                 <div className="mb-3">
                   <p className="text-gray-400 font-semibold">
                     Example {index + 1} – Input
                   </p>
                   <pre className=" text-gray-200 p-3 rounded mt-1 whitespace-pre-wrap">
                     {tc.input}
                   </pre>
                 </div>

                 <div>
                   <p className="text-gray-400 font-semibold">
                     Output
                   </p>
                   <pre className="text-gray-200 p-3 rounded mt-1 whitespace-pre-wrap">
                     {tc.output}
                   </pre>
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}


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
      <div
        ref={editorRef}
        className="border border-gray-700 rounded"
        style={{ height: "400px" }}
      />

      {/* Run Button */}
      <button
        onClick={handleRun}
        className="mt-4 px-6 py-2 bg-teal-500 hover:bg-teal-600 rounded font-semibold"
      >
        Run
      </button>

      {/* Output */}
      <div className="mt-4 bg-black text-green-400 p-4 rounded font-mono whitespace-pre-wrap min-h-[120px]">
        {output}
      </div>
    </div>
  );
};

export default QuestionSolve;
