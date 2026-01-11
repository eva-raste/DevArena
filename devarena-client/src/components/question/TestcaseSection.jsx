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
  lastAddedId,
}) => {
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
    <div className="flex justify-between mb-4">
      <h3 className="font-bold text-foreground">
        {title} ({testcases.length})
      </h3>

      <button
        onClick={() => onAdd(type)}
        className="
          px-4 py-2
          rounded-xl
          bg-primary
          hover:bg-primary/90
          text-primary-foreground
          transition-all
          shadow-md
          font-medium
        "
      >
        + Add
      </button>
    </div>

    {testcases.map((tc, i) => (
      <TestcaseRow
        key={tc.id}
        ref={(el) => (rowRefs.current[tc.id] = el)}
        testcase={tc}
        index={i}
        total={testcases.length}
        type={type}
        onMove={onMove}
        onDuplicate={onDuplicate}
        onRemove={onRemove}
        onUpdate={onUpdate}
      />
    ))}
  </div>
)

}
