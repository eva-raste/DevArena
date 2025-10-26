import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import * as monaco from "monaco-editor";

const Solve = () => {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const editorRef = useRef(null);
  const monacoEditor = useRef(null);

  const languages = ["c", "cpp", "java", "python", "javascript"];

  const lcLangMap = {
    c: "c",
    cpp: "cpp",
    java: "java",
    python: "python3",
    javascript: "javascript",
  };

const pistonLangMap = {
  c: "c",
  cpp: "cpp",
  java: "java",
  python: "python3",
  javascript: "javascript",
};

  const monacoLangMap = {
    c: "c",
    cpp: "cpp",
    java: "java",
    python: "python",
    javascript: "javascript",
  };

  // Fallback templates
  const fallbackTemplates = {
    c: `#include <stdio.h>\nint main() {\n  printf("Hello World\\n");\n  return 0;\n}`,
    cpp: `#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello World" << endl;\n  return 0;\n}`,
    java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World");\n  }\n}`,
    python: `print("Hello World")`,
    javascript: `console.log("Hello World")`,
  };

  useEffect(() => {
    if (!slug) {
      console.error("Slug is undefined!");
      return;
    }

    const fetchProblem = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/problem/${slug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();

        if (!data?.data?.question) {
          console.error("Problem not found or invalid slug");
          setProblem(null);
          return;
        }

        const q = data.data.question;
        const codeMap = {};
        q.codeSnippets?.forEach(snippet => {
          codeMap[snippet.lang.toLowerCase()] = snippet.code;
        });
        setProblem({ ...q, codeMap });
      } catch (err) {
        console.error(err);
        setProblem(null);
      }
    };

    fetchProblem();
  }, [slug]);

  useEffect(() => {
    if (!editorRef.current || !problem) return;

    const initialCode =
      problem.codeMap?.[lcLangMap[language]] || fallbackTemplates[language];

    monacoEditor.current = monaco.editor.create(editorRef.current, {
      value: initialCode,
      language: monacoLangMap[language],
      theme: "vs-dark",
      automaticLayout: true,
    });

    return () => monacoEditor.current?.dispose();
  }, [problem]);

  useEffect(() => {
    if (!monacoEditor.current || !problem) return;

    const newValue =
      problem.codeMap?.[lcLangMap[language]] || fallbackTemplates[language];

    const model = monaco.editor.createModel(newValue, monacoLangMap[language]);
    monacoEditor.current.setModel(model);
  }, [language, problem]);

  const handleRun = async () => {
    setOutput("Running...");
    const code = monacoEditor.current.getValue();

    try {
      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: pistonLangMap[language],
          version: "latest",
          files: [{ name: `Main.${language}`, content: code }],
        }),
      });


      const data = await res.json();

      let rawOutput = "";
      if (data.compile) rawOutput += data.compile.output || "";
      if (data.run) rawOutput += data.run.output || "";

      const cleanedOutput = rawOutput
        .replace(/File\s+"\/piston\/jobs\/[^\n"]+"/g, 'File "Main"')
        .replace(/\/piston\/jobs\/[^\s]*/g, "Main");

      setOutput(cleanedOutput.trim() || "(no output)");
    } catch (err) {
      console.error(err);
      setOutput("Error executing code");
    }
  };

  if (!problem) return <p>Loading problem...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{problem.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: problem.content }} />

      <div style={{ marginTop: "10px" }}>
        <label htmlFor="language">Language: </label>
        <select
          id="language"
          value={language}
          onChange={e => setLanguage(e.target.value)}
        >
          {languages.map(lang => (
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
