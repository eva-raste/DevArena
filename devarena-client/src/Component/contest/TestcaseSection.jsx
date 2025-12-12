"use client"
import { TestcaseRow } from "./TestcaseRow"
import { useRef, useEffect } from "react"

export const TestcaseSection = ({
  title,
  type,
  testcases,
  onAdd,
  onMove,
  onDuplicate,
  onRemove,
  onUpdate,
  lastAddedId, // New prop to track which testcase was just added
}) => {
  const buttonClasses =
    type === "sampleTestcases"
      ? "bg-teal-500 hover:bg-teal-600 hover:shadow-teal-500/50"
      : "bg-purple-500 hover:bg-purple-600 hover:shadow-purple-500/50"

  const rowRefs = useRef({})

  useEffect(() => {
    if (lastAddedId && rowRefs.current[lastAddedId]) {
      rowRefs.current[lastAddedId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [lastAddedId])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-200">
          {title}
          <span className="ml-2 text-sm text-gray-500">({testcases.length})</span>
        </h3>
        <button
          onClick={() => onAdd(type)}
          className={`px-4 py-2 ${buttonClasses} text-white rounded-2xl transition-all shadow-lg font-medium`}
        >
          + Add {type === "sampleTestcases" ? "Sample" : "Hidden"}
        </button>
      </div>

      <div className="space-y-4">
        {testcases.map((tc, i) => (
          <TestcaseRow
            key={tc.id}
            ref={(el) => (rowRefs.current[tc.id] = el)}
            testcase={tc}
            type={type}
            index={i}
            total={testcases.length}
            onMove={onMove}
            onDuplicate={onDuplicate}
            onRemove={onRemove}
            onUpdate={onUpdate}
          />
        ))}
        {testcases.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No {type === "sampleTestcases" ? "sample" : "hidden"} testcases yet
          </p>
        )}
      </div>
    </div>
  )
}
