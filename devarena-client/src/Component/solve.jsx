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
    c: { monaco: "c", piston: "c", ext: "c", version: "10.2.0" },
    cpp: { monaco: "cpp", piston: "c++", ext: "cpp", version: "10.2.0" },
  };

  const fallbackTemplates = {
    c: `#include <stdio.h>\nint main() {\n  printf("Hello World\\n");\n  return 0;\n}`,
    cpp: `#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello World" << endl;\n  return 0;\n}`,
  };

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/problem/${slug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        const q = data?.data?.question;
        if (!q) {
          setProblem(null);
          return;
        }
        const codeMap = {};
        q.codeSnippets?.forEach((snippet) => {
          const lang = snippet.lang.toLowerCase();
          if (lang === "c++") codeMap["cpp"] = snippet.code;
          else if (lang === "c") codeMap["c"] = snippet.code;
        });
        setProblem({ ...q, codeMap });
      } catch {
        setProblem(null);
      }
    };
    fetchProblem();
  }, [slug]);

  useEffect(() => {
    if (!editorRef.current || !problem) return;
    const initialCode = problem.codeMap?.[language] || fallbackTemplates[language];
    monacoEditor.current = monaco.editor.create(editorRef.current, {
      value: initialCode,
      language: langMap[language].monaco,
      theme: "vs-dark",
      automaticLayout: true,
    });
    return () => monacoEditor.current?.dispose();
  }, [problem]);

  useEffect(() => {
    if (!monacoEditor.current || !problem) return;
    const newValue = problem.codeMap?.[language] || fallbackTemplates[language];
    const model = monaco.editor.createModel(newValue, langMap[language].monaco);
    monacoEditor.current.setModel(model);
  }, [language, problem]);

  const handleRun = async () => {
    try {
      setOutput("🧠 Generating main() function using AI...");

      const userCode = monacoEditor.current.getValue();
      const funcMatch = userCode.match(/[\w<>]+\s+\w+\s*\([^)]*\)/);
      const funcSignature = funcMatch ? funcMatch[0] : "int solve()";

      const res = await fetch("http://localhost:8080/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: problem.content,
          function: funcSignature,
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid backend JSON: " + text);
      }

      if (data.error) {
        setOutput("❌ AI generation failed: " + data.error);
        return;
      }

      const mainFunction = data.mainFunction;

      const functionMatch = userCode.match(/class\s+Solution\s*{[^}]*\b(\w+)\s*\(/);
      let functionName = functionMatch ? functionMatch[1] : null;

      let fixedMain = mainFunction;
      if (functionName) {
        const regex = new RegExp(`\\b${functionName}\\s*\\(`, "g");
        fixedMain = mainFunction.replace(regex, `Solution().${functionName}(`);
      }

      const finalCode = `
      #include <bits/stdc++.h>
      using namespace std;

      ${userCode}

      ${fixedMain}
      `.trim();

console.log(finalCode);
      const exampleRegex = /Input:\s*([^\n\r]*)/gi;
      const examples = [];
      let match;
      while ((match = exampleRegex.exec(problem.content))) {
            examples.push(match[1].replace(/<\/?strong>/gi, "").trim());
      }
      console.log(examples);

      setOutput(`🚀 Running ${examples.length} test case(s)...`);

      const results = [];
      for (const input of examples) {
        const pistonRes = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: "c++",
            version: "10.2.0",
            files: [{ name: "main.cpp", content: finalCode }],
            stdin: input,
          }),
        });

        const result = await pistonRes.json();
        results.push({
          input,
          stdout: result.run?.stdout || "",
          stderr: result.run?.stderr || "",
        });
      }

      let formatted = "";
      results.forEach((r, i) => {
        formatted += `Example ${i + 1}\nInput: ${r.input}\n`;
        if (r.stdout.trim()) formatted += `Output:\n${r.stdout.trim()}\n`;
        if (r.stderr.trim()) formatted += `Error:\n${r.stderr.trim()}\n`;
        formatted += "---------------------\n";
      });

      setOutput(formatted || "(no output)");
    } catch (err) {
      setOutput(" Error: " + err.message);
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
