"use client"

export const PublishModal = ({ question, onClose, onCopy, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-3xl w-full bg-gray-900/80 rounded-3xl p-6 shadow-2xl border border-gray-700/30">
        <h3 className="text-xl font-bold mb-3">Confirm Publish</h3>
        <p className="text-sm text-gray-400 mb-4">
          Review the JSON payload below. Click <span className="font-semibold text-gray-200">Confirm Publish</span> to
          call the publish handler.
        </p>

        <div className="bg-gray-800/40 p-4 rounded-lg max-h-[420px] overflow-auto mb-4">
          <pre className="whitespace-pre-wrap text-sm font-mono">{JSON.stringify(question, null, 2)}</pre>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => onCopy(JSON.stringify(question, null, 2))}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-2xl text-sm transition-all"
          >
            Copy JSON
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-2xl text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-2xl text-sm shadow-lg"
          >
            Confirm Publish
          </button>
        </div>
      </div>
    </div>
  )
}
