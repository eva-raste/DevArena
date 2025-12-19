import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import * as monaco from "monaco-editor";

const Solve = () => {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");
  const editorRef = useRef(null);
  const monacoEditor = useRef(null);

  const languages = ["c", "cpp"];

  const langMap = {
    c: { monaco: "c" },
    cpp: { monaco: "cpp" },
  };

  const fallbackTemplates = {
    c: `#include <stdio.h>
int main() {
  printf("Hello World\\n");
  return 0;
}`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
  cout << "Hello World" << endl;
  return 0;
}`,
  };

  // Fetch problem
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/problem/${slug}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await res.json();
        const q = data?.data?.question;

        if (!q) {
          setProblem(null);
          return;
        }

        const codeMap = {};
        q.codeSnippets?.forEach((snippet) => {
          const lang = snippet.lang.toLowerCase();
          if (lang === "c++") codeMap.cpp = snippet.code;
          if (lang === "c") codeMap.c = snippet.code;
        });

        setProblem({ ...q, codeMap });
      } catch {
        setProblem(null);
      }
    };

    fetchProblem();
  }, [slug]);

  // Init Monaco
  useEffect(() => {
    if (!editorRef.current || !problem) return;

    const initialCode =
      problem.codeMap?.[language] || fallbackTemplates[language];

    monacoEditor.current = monaco.editor.create(editorRef.current, {
      value: initialCode,
      language: langMap[language].monaco,
      theme: "vs-dark",
      automaticLayout: true,
    });

    return () => monacoEditor.current?.dispose();
  }, [problem]);

  // Change language
  useEffect(() => {
    if (!monacoEditor.current || !problem) return;

    const newValue =
      problem.codeMap?.[language] || fallbackTemplates[language];

    const model = monaco.editor.createModel(
      newValue,
      langMap[language].monaco
    );
    monacoEditor.current.setModel(model);
  }, [language, problem]);

  // Run code
  const handleRun = async () => {
    try {
      setOutput("⏳ Running code...");

      const userCode = monacoEditor.current.getValue();

      const exampleRegex = /Input:\s*([^\n\r]*)/gi;
      const examples = [];
      let match;

      while ((match = exampleRegex.exec(problem.content))) {
        examples.push(
          match[1].replace(/<\/?strong>/gi, "").trim()
        );
      }

      if (examples.length === 0) {
        setOutput("⚠ No example inputs found.");
        return;
      }

      const results = [];

      for (const input of examples) {
        const res = await fetch("http://localhost:8080/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: userCode,
            stdin: input,
          }),
        });

        const result = await res.json();
        results.push({
          input,
          stdout: result.stdout || "",
          stderr: result.stderr || "",
        });
      }

      let formatted = "";

      results.forEach((r, i) => {
        formatted += `Example ${i + 1}\n`;
        formatted += `Input:\n${r.input}\n`;

        if (r.stdout.trim()) {
          formatted += `Output:\n${r.stdout}\n`;
        }

        if (r.stderr.trim()) {
          formatted += `Error:\n${r.stderr}\n`;
        }

        formatted += "---------------------\n";
      });

      setOutput(formatted || "(no output)");
    } catch (err) {
      setOutput("❌ Error: " + err.message);
    }
  };

  if (!problem) return <p>Loading problem...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{problem.title}</h2>

      <div dangerouslySetInnerHTML={{ __html: problem.content }} />

      <div style={{ marginTop: "10px" }}>
        <label>Language: </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div
        ref={editorRef}
        style={{
          width: "800px",
          height: "400px",
          border: "1px solid grey",
          marginTop: "10px",
        }}
      />

      <button onClick={handleRun} style={{ marginTop: "10px" }}>
        Run
      </button>

      <div
        style={{
          marginTop: "10px",
          width: "800px",
          minHeight: "100px",
          background: "#1e1e1e",
          color: "#00ff99",
          padding: "10px",
          borderRadius: "5px",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
        }}
      >
        {output}
      </div>
    </div>
  );
};

export default Solve;
