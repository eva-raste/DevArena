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
      <div className="flex items-center gap-3 pl-4 border-l-4 border-primary py-1">
  <h3 className="text-xl font-bold tracking-tight text-foreground">
    {title}
  </h3>
  <span className="flex items-center justify-center px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium shadow-sm">
    {testcases.length}
  </span>
</div>

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
