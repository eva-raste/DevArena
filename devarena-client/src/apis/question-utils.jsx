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
    constraints: string,
    sampleTestcases: Testcase[],
    hiddenTestcases: Testcase[]
  }
*/

// Helper: Validate question (returns array of error strings)
export const validateQuestion = (state) => {
  const errors = [];

  if (!state || typeof state !== "object") {
    return ["Invalid question state"];
  }

  const {
    title,
    description,
    difficulty,
    constraints,
    sampleTestcases,
    hiddenTestcases,
  } = state;

  /* ---------- BASIC REQUIRED FIELDS ---------- */

  if (!title?.trim()) {
    errors.push("Title is required");
  }

  if (!description?.trim()) {
    errors.push("Description is required");
  }

  if (!difficulty?.trim()) {
    errors.push("Difficulty is required");
  }

  if (!constraints?.trim()) {
    errors.push("Constraints are required");
  }

  /* ---------- ARRAY VALIDATION ---------- */

  if (!Array.isArray(sampleTestcases)) {
    errors.push("Sample testcases must be an array");
  }

  if (!Array.isArray(hiddenTestcases)) {
    errors.push("Hidden testcases must be an array");
  }

  const sample = Array.isArray(sampleTestcases)
    ? sampleTestcases
    : [];

  const hidden = Array.isArray(hiddenTestcases)
    ? hiddenTestcases
    : [];

  /* ---------- REQUIRED COUNTS ---------- */

  if (sample.length === 0) {
    errors.push("At least one sample testcase is required");
  }

  if (hidden.length === 0) {
    errors.push("At least one hidden testcase is required");
  }

  if (sample.length > 4) {
    errors.push("Sample testcases cannot exceed 4");
  }

  if (hidden.length > 20) {
    errors.push("Hidden testcases cannot exceed 20");
  }

  /* ---------- TESTCASE STRUCTURE VALIDATION ---------- */

  const validateTestcaseList = (list, type) => {
    const orders = new Set();
    const contentSet = new Set();

    list.forEach((tc, index) => {
      if (!tc || typeof tc !== "object") {
        errors.push(`${type} testcase at position ${index + 1} is invalid`);
        return;
      }

      if (!tc.input?.trim()) {
        errors.push(`${type} testcase ${index + 1} input is required`);
      }

      if (!tc.output?.trim()) {
        errors.push(`${type} testcase ${index + 1} output is required`);
      }

      if (typeof tc.order !== "number") {
        errors.push(`${type} testcase ${index + 1} must have order`);
      } else {
        if (orders.has(tc.order)) {
          errors.push(`${type} testcases contain duplicate order`);
        }
        orders.add(tc.order);
      }

      // Duplicate testcase content check
      const signature = `${tc.input.trim()}__${tc.output.trim()}`;
      if (contentSet.has(signature)) {
        errors.push(`${type} testcases contain duplicate input-output pair`);
      }
      contentSet.add(signature);
    });

    // Order continuity check
    const sortedOrders = [...orders].sort((a, b) => a - b);
    for (let i = 0; i < sortedOrders.length; i++) {
      if (sortedOrders[i] !== i + 1) {
        errors.push(`${type} testcase order must be continuous starting from 1`);
        break;
      }
    }
  };

  validateTestcaseList(sample, "Sample");
  validateTestcaseList(hidden, "Hidden");

  return errors;
};


