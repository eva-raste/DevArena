"use client"
import { TestcaseSection } from "./TestcaseSection"
import styles from './css/QuestionForm.module.css';

export const QuestionForm = ({
  question,
  errors,
  slugWarning,
  showConstraintsGuide,
  scoreInput,
  onInputChange,
  onScoreInputChange,
  onMakeSlugUnique,
  onToggleConstraintsGuide,
  onAddTestcase,
  onMoveTestcase,
  onDuplicateTestcase,
  onRemoveTestcase,
  onUpdateTestcase,
  onSaveDraft,
  onValidate,
  onPublishClick,
  lastAddedSampleId,
  lastAddedHiddenId,
}) => {
  return (
  <div className={`${styles.container} p-8 rounded-3xl shadow-2xl space-y-6`}>
      {errors.length > 0 && (
        <div
          className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-4"
          role="alert"
        >
          <h3 className="font-bold text-red-400 mb-2">Validation Errors:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-300">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Question Title *
        </label>
        <input
          type="text"
          value={question.title ?? ""}
          onChange={(e) => onInputChange("title", e.target.value)}
          className="w-full bg-gray-900/50 text-gray-100 rounded-2xl px-6 py-3 border-2 border-gray-700/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all shadow-inner"
          placeholder="Enter question title..."
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Question Slug
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={question.questionSlug ?? ""}
            onChange={(e) => onInputChange("questionSlug", e.target.value)}
            className="flex-1 bg-gray-900/50 text-gray-100 rounded-2xl px-6 py-3 border-2 border-gray-700/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all shadow-inner font-mono"
            placeholder="auto-generated-slug"
          />
          {slugWarning && (
            <button
              type="button"
              onClick={onMakeSlugUnique}
              className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-2xl hover:bg-yellow-500/30 transition-all border-2 border-yellow-500/30 font-medium"
            >
              Make Unique
            </button>
          )}
        </div>

        {slugWarning && (
          <p className="text-yellow-400 text-sm mt-1 flex items-center gap-2">
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
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description <span className="text-gray-500 text-xs">(Markdown supported)</span>
        </label>
        <textarea
        
          value={question.description ?? ""}
          onChange={(e) => onInputChange("description", e.target.value)}
          className={`w-full bg-gray-900/50 text-gray-100 rounded-2xl px-6 py-3 border-2 border-gray-700/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all shadow-inner resize-y min-h-[200px] max-h-[400px]"
          placeholder="Write your question description here...`}
        />
      </div>

      {/* Difficulty & Score */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
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
                    className={`font-medium ${
                      diff === "EASY"
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

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Score *
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={scoreInput ?? ""}
            onChange={onScoreInputChange}
            className="w-full bg-gray-900/50 text-gray-100 rounded-2xl px-6 py-3 border-2 border-gray-700/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all shadow-inner"
            placeholder="100"
          />
        </div>
      </div>

      {/* Constraints */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-300">
            Constraints
          </label>
          <button
            type="button"
            onClick={onToggleConstraintsGuide}
            className="text-xs text-teal-400 hover:text-teal-300 transition-all"
          >
            {showConstraintsGuide ? "Hide" : "Show"} Guide
          </button>
        </div>

        {showConstraintsGuide && (
          <div className="bg-gray-900/50 rounded-xl p-4 mb-3 text-sm text-gray-400 font-mono">
            {"1 ≤ n ≤ 10^5\n-10^9 ≤ arr[i] ≤ 10^9\n1 ≤ queries ≤ 10^4"}
          </div>
        )}

        <textarea
          value={question.constraints ?? ""}
          onChange={(e) => onInputChange("constraints", e.target.value)}
          className={`w-full bg-gray-900/50 text-gray-100 rounded-2xl px-6 py-3 border-2 border-gray-700/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all shadow-inner font-mono text-sm resize-y min-h-[120px] max-h-[300px]`}
        />
      </div>

      {/* Testcases */}
      <TestcaseSection
        title="Sample Testcases"
        type="sampleTestcases"
        testcases={question.sampleTestcases ?? []}
        onAdd={onAddTestcase}
        onMove={onMoveTestcase}
        onDuplicate={onDuplicateTestcase}
        onRemove={onRemoveTestcase}
        onUpdate={onUpdateTestcase}
        lastAddedId={lastAddedSampleId}
      />

      <TestcaseSection
        title="Hidden Testcases"
        type="hiddenTestcases"
        testcases={question.hiddenTestcases ?? []}
        onAdd={onAddTestcase}
        onMove={onMoveTestcase}
        onDuplicate={onDuplicateTestcase}
        onRemove={onRemoveTestcase}
        onUpdate={onUpdateTestcase}
        lastAddedId={lastAddedHiddenId}
      />

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 pt-4">
        <button
          type="button"
          onClick={onSaveDraft}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl transition-all shadow-lg font-medium"
        >
          Save Draft
        </button>

        <button
          type="button"
          onClick={onValidate}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-all shadow-lg"
        >
          Validate
        </button>

        <button
          type="button"
          onClick={onPublishClick}
          className="px-6 py-3 bg-linear-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white rounded-2xl transition-all shadow-lg"
        >
          Publish Question
        </button>
      </div>
    </div>
  )
}
