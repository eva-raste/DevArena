import { renderMarkdown } from "../../apis/question-utils"
import getDifficultyColor from "../helpers/colorDifficulty"

export const LivePreview = ({ question }) => {

  return (
  <div className="bg-card/30 backdrop-blur-sm p-6 rounded-3xl shadow-2xl">
    <h2 className="text-2xl font-bold mb-4 text-primary">
      Live Preview
    </h2>

    <div className="bg-card/50 rounded-2xl p-6 border-2 border-border">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-2xl font-bold text-foreground">
          {question.title || "Untitled Question"}
        </h3>

        {question.score > 0 && (
          <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-bold">
            {question.score} pts
          </span>
        )}
      </div>

      {question.difficulty && (
        <div className="mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(question.difficulty)}`}
          >
            {question.difficulty.toUpperCase()}
          </span>
        </div>
      )}

      {question.description ? (
        <div
          className="prose max-w-none text-sm text-foreground"
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(question.description),
          }}
        />
      ) : (
        <p className="text-muted-foreground">
          No description yet
        </p>
      )}

      <div className="mt-6">
        <h4 className="font-bold text-foreground mb-2">
          Sample Tests
        </h4>

        <div className="space-y-3">
          {question.sampleTestcases &&
          question.sampleTestcases.length > 0 ? (
            question.sampleTestcases.map((tc) => (
              <div
                key={tc.id}
                className="bg-card/40 p-3 rounded-lg font-mono text-sm border border-border"
              >
                <div className="text-muted-foreground mb-1">
                  Input:
                </div>
                <pre className="whitespace-pre-wrap text-sm text-foreground mb-2">
                  {tc.input || "<empty>"}
                </pre>

                <div className="text-muted-foreground mb-1">
                  Output:
                </div>
                <pre className="whitespace-pre-wrap text-sm text-foreground">
                  {tc.output || "<empty>"}
                </pre>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">
              No sample tests
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
)

}
