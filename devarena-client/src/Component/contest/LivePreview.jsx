import { renderMarkdown } from "../../lib/question-utils"

export const LivePreview = ({ question }) => {
  return (
    <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-3xl shadow-2xl">
      <h2 className="text-2xl font-bold mb-4 text-teal-400">Live Preview</h2>

      <div className="bg-gray-900/50 rounded-2xl p-6 border-2 border-gray-700/50">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-100">{question.title || "Untitled Question"}</h3>
          {question.score > 0 && (
            <span className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-sm font-bold">
              {question.score} pts
            </span>
          )}
        </div>

        {question.difficulty && (
          <div className="mb-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                question.difficulty === "easy"
                  ? "bg-green-500/20 text-green-400"
                  : question.difficulty === "medium"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
              }`}
            >
              {question.difficulty.toUpperCase()}
            </span>
          </div>
        )}

        {question.description ? (
          <div
            className="prose prose-invert max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(question.description) }}
          />
        ) : (
          <p className="text-gray-500">No description yet</p>
        )}

        <div className="mt-6">
          <h4 className="font-bold text-gray-200 mb-2">Sample Tests</h4>
          <div className="space-y-3">
            {question.sampleTestcases && question.sampleTestcases.length > 0 ? (
              question.sampleTestcases.map((tc) => (
                <div key={tc.id} className="bg-gray-800/40 p-3 rounded-lg font-mono text-sm border border-gray-700/30">
                  <div className="text-gray-300 mb-1">Input:</div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-200 mb-2">{tc.input || "<empty>"}</pre>
                  <div className="text-gray-300 mb-1">Output:</div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-200">{tc.output || "<empty>"}</pre>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No sample tests</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
