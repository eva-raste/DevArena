"use client"

export const JsonPreview = ({ question, onCopy, onPreviewPublish }) => {
  return (
    <div className="bg-gray-800/20 p-4 rounded-2xl border border-gray-700/30">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold">JSON Preview</h4>
          <p className="text-sm text-gray-400">Formatted question payload</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onCopy(JSON.stringify(question, null, 2))}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-all"
            aria-label="Copy JSON"
          >
            Copy JSON
          </button>
          <button
            onClick={onPreviewPublish}
            className="px-3 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg text-sm text-white transition-all"
          >
            Preview & Publish
          </button>
        </div>
      </div>

      <pre className="mt-4 max-h-[260px] overflow-auto bg-gray-900/40 p-4 rounded-lg text-sm font-mono border border-gray-700/20">
        {JSON.stringify(question, null, 2)}
      </pre>
    </div>
  )
}
