"use client"
import styles from "./css/QuestionForm.module.css"

export const QuestionForm = ({
  question,
  errors,
  slugWarning,
  showConstraintsGuide,
  onInputChange,
  onToggleConstraintsGuide,

  onValidate,
  onPublishClick,

}) => {

  const generateSlugFromTitle = () => {
    if (!question.title) return;

    const slug = question.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")   // remove special chars
      .replace(/\s+/g, "-")           // spaces → hyphen
      .replace(/-+/g, "-")        // remove duplicate hyphens
      .replace(/^-+/, "")             // remove leading hyphens
      .replace(/-+$/, "");            // remove trailing hyphens
    onInputChange("questionSlug", slug);
  };

  return (
    <div className={`${styles.container} p-8 rounded-3xl shadow-2xl space-y-6 bg-background`}>
      {errors.length > 0 && (
        <div
          className="bg-destructive/15 border-2 border-destructive rounded-2xl p-4"
          role="alert"
        >
          <h3 className="font-bold text-destructive mb-2">
            Validation Errors:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-destructive/90">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          Question Title *
        </label>
        <input
          type="text"
          value={question.title ?? ""}
          onChange={(e) => onInputChange("title", e.target.value)}
          className="w-full bg-card text-foreground rounded-2xl px-6 py-3 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all shadow-inner"
          placeholder="Enter question title..."
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          Question Slug
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={question.questionSlug ?? ""}
            onChange={(e) => onInputChange("questionSlug", e.target.value)}
            className="flex-1 bg-card text-foreground rounded-2xl px-6 py-3 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all shadow-inner font-mono"
            placeholder="auto-generated-slug"
          />

          <button
            type="button"
            onClick={generateSlugFromTitle}
            className="px-4 py-3 rounded-2xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
          >
            From Title
          </button>
        </div>

        {slugWarning && (
          <p className="text-accent text-sm mt-1 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z"
                clipRule="evenodd"
              />
            </svg>
            This slug already exists
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          Description{" "}
          <span className="text-foreground/50 text-xs">(Markdown supported)</span>
        </label>
        <textarea
          value={question.description ?? ""}
          onChange={(e) => onInputChange("description", e.target.value)}
          className="w-full bg-card text-foreground rounded-2xl px-6 py-3 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all shadow-inner resize-y min-h-[200px] max-h-[400px]"
          placeholder="Write your question description here..."
        />
      </div>

      {/* Difficulty */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Difficulty *
          </label>
          <div className="space-y-2">
            {["EASY", "MEDIUM", "HARD"].map((diff) => (
              <label key={diff} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="difficulty"
                  value={diff}
                  checked={question.difficulty === diff}
                  onChange={(e) => onInputChange("difficulty", e.target.value)}
                  className="w-5 h-5 text-teal-500 focus:ring-teal-500 focus:ring-2"
                />
                <span
                  className={`font-medium ${diff === "EASY"
                    ? "text-green-400"
                    : diff === "MEDIUM"
                      ? "text-yellow-400"
                      : "text-red-400"
                    }`}
                >
                  {diff}
                </span>
              </label>
            ))}

          </div>
        </div>
      </div>

      {/* Constraints */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-foreground/80">
            Constraints
          </label>
          <button
            type="button"
            onClick={onToggleConstraintsGuide}
            className="text-xs text-primary hover:text-primary/80 transition-all"
          >
            {showConstraintsGuide ? "Hide" : "Show"} Guide
          </button>
        </div>

        {showConstraintsGuide && (
          <div className="bg-card border border-border rounded-xl p-4 mb-3 text-sm text-foreground/80 font-mono">
            {"1 ≤ n ≤ 10^5\n-10^9 ≤ arr[i] ≤ 10^9\n1 ≤ queries ≤ 10^4"}
          </div>
        )}

        <textarea
          value={question.constraints ?? ""}
          onChange={(e) => onInputChange("constraints", e.target.value)}
          className="w-full bg-card text-foreground rounded-2xl px-6 py-3 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all shadow-inner font-mono text-sm resize-y min-h-[120px] max-h-[300px]"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 pt-4">


        <button
          type="button"
          onClick={onValidate}
          className="px-6 py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-2xl transition-all shadow-lg"
        >
          Validate
        </button>

        <button
          type="button"
          onClick={onPublishClick}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl transition-all shadow-xl"
        >
          Publish Question
        </button>
      </div>
    </div>
  )
}
