// Helpers (JSX / plain JavaScript)
// - generateUUID
// - slugify
// - renderMarkdown
// - validateQuestion
// - Testcase and QuestionState shapes are documented in comments (no TypeScript types)

export const generateUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Convert title to slug - simple: replace spaces with dashes and lower-case
export const slugify = (title) => {

  return String(title || "").trim().replace(/\s+/g, "-").toLowerCase()
}

// Simple HTML escape to reduce XSS risk for this small renderer
const escapeHtml = (unsafe) => {
  return String(unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

// Basic Markdown -> HTML (limited feature set)
export const renderMarkdown = (text) => {
  if (!text) return ""
  const safe = escapeHtml(text)

  let html = safe
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
    .replace(
      /```([\s\S]*?)```/gim,
      '<pre class="bg-gray-900 p-3 rounded-lg my-2 overflow-x-auto"><code>$1</code></pre>',
    )
    .replace(/`(.*?)`/gim, '<code class="bg-gray-800 px-1.5 py-0.5 rounded text-sm">$1</code>')
    .replace(/^- (.*$)/gim, "<li>$1</li>")
    .replace(/\n/gim, "<br />")

  if (html.includes("<li>")) {
    const liAll = html.match(/(<li>[\s\S]*?<\/li>)/gim)
    if (liAll && liAll.length > 0) {
      const joined = liAll.join("")
      html = html.replace(joined, `<ul class="list-disc list-inside ml-4">${joined}</ul>`)
    }
  }

  return html
}

/*
 Data shapes (JS doc-style)

 Testcase:
  { id: string, input: string, output: string }

 QuestionState:
  {
    questionId: string,
    question_slug: string,
    title: string,
    description: string,
    difficulty: string,
    score: number,
    constraints: string,
    sampleTestcases: Testcase[],
    hiddenTestcases: Testcase[]
  }
*/

// Helper: Validate question (returns array of error strings)
export const validateQuestion = (state) => {
  const errors = [];

  if (!state) {
    return ["Invalid question state"];
  }

  // ---------- BASIC FIELDS ----------

  if (!state.title || !state.title.trim()) {
    errors.push("Title is required");
  }

  if (!state.difficulty) {
    errors.push("Difficulty must be selected");
  }

  if (!Number.isInteger(state.score) || state.score <= 0) {
    errors.push("Score must be a positive integer");
  }

  // ---------- TESTCASE LIMITS ----------

  const sample = Array.isArray(state.sampleTestcases)
    ? state.sampleTestcases
    : [];

  const hidden = Array.isArray(state.hiddenTestcases)
    ? state.hiddenTestcases
    : [];

  if (sample.length > 4) {
    errors.push("Sample testcases cannot exceed 4");
  }

  if (hidden.length > 20) {
    errors.push("Hidden testcases cannot exceed 20");
  }

  // ---------- SAMPLE REQUIRED ----------

  if (sample.length === 0) {
    errors.push("At least one sample testcase is required");
  }

  // ---------- CONTENT VALIDATION ----------

  const hasInvalidSample = sample.some(
    (tc) =>
      !tc ||
      typeof tc.input !== "string" ||
      typeof tc.output !== "string" ||
      !tc.input.trim() ||
      !tc.output.trim()
  );

  if (hasInvalidSample) {
    errors.push("All sample testcases must have non-empty input and output");
  }

  const hasInvalidHidden = hidden.some(
    (tc) =>
      !tc ||
      typeof tc.input !== "string" ||
      typeof tc.output !== "string" ||
      !tc.input.trim() ||
      !tc.output.trim()
  );

  if (hasInvalidHidden) {
    errors.push("All hidden testcases must have non-empty input and output");
  }

  // ---------- ORDER CONTINUITY CHECK ----------

  const isContinuous = (list) => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].order !== i + 1) {
        return false;
      }
    }
    return true;
  };

  if (!isContinuous(sample)) {
    errors.push("Sample testcase order is invalid");
  }

  if (!isContinuous(hidden)) {
    errors.push("Hidden testcase order is invalid");
  }

  return errors;
};

