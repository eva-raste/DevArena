"use client"

import { useRef, useEffect, useCallback, forwardRef } from "react"

export const TestcaseRow = forwardRef(
  ({ testcase, type, index, total, onMove, onDuplicate, onRemove, onUpdate }, ref) => {
    const isEmpty = !testcase.input || !testcase.input.trim() || !testcase.output || !testcase.output.trim()

    const inputRef = useRef(null)
    const outputRef = useRef(null)
    const cursorPositionRef = useRef({ field: null, position: 0 })

    const handleChange = useCallback(
      (field, value) => {
        // Save cursor position before update
        const activeElement = document.activeElement
        if (activeElement === inputRef.current) {
          cursorPositionRef.current = { field: "input", position: activeElement.selectionStart }
        } else if (activeElement === outputRef.current) {
          cursorPositionRef.current = { field: "output", position: activeElement.selectionStart }
        }
        onUpdate(type, testcase.id, field, value)
      },
      [type, testcase.id, onUpdate],
    )

    // Restore cursor position after render
    useEffect(() => {
      const { field, position } = cursorPositionRef.current
      if (field === "input" && inputRef.current) {
        inputRef.current.focus()
        inputRef.current.setSelectionRange(position, position)
      } else if (field === "output" && outputRef.current) {
        outputRef.current.focus()
        outputRef.current.setSelectionRange(position, position)
      }
    })

    return (
  <div
    ref={ref}
    className={`
      bg-card/80
      p-4
      rounded-xl
      border-2
      transition-all
      ${isEmpty ? "border-destructive/40" : "border-border"}
    `}
    style={{ animation: "fadeSlideIn 0.25s ease-out" }}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-mono text-muted-foreground">
        Test #{index + 1}
      </span>

      <div className="flex gap-2">
        <button
          onClick={() => onMove(type, index, "up")}
          disabled={index === 0}
          className="
            p-1.5
            rounded-lg
            bg-muted
            hover:bg-muted/80
            disabled:opacity-30
            disabled:cursor-not-allowed
            transition-all
          "
          aria-label="Move up"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        <button
          onClick={() => onMove(type, index, "down")}
          disabled={index === total - 1}
          className="
            p-1.5
            rounded-lg
            bg-muted
            hover:bg-muted/80
            disabled:opacity-30
            disabled:cursor-not-allowed
            transition-all
          "
          aria-label="Move down"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <button
          onClick={() => onDuplicate(type, testcase)}
          className="
            p-1.5
            rounded-lg
            bg-muted
            hover:bg-primary/20
            hover:text-primary
            transition-all
          "
          aria-label="Duplicate"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>

        <button
          onClick={() => onRemove(type, testcase.id)}
          className="
            p-1.5
            rounded-lg
            bg-muted
            hover:bg-destructive/20
            hover:text-destructive
            transition-all
          "
          aria-label="Remove"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>

    <div className="space-y-3">
      <div>
        <label className="block text-sm text-muted-foreground mb-1 font-mono">
          Input
        </label>
        <textarea
          ref={inputRef}
          value={testcase.input}
          onChange={(e) => handleChange("input", e.target.value)}
          className="
            w-full
            bg-background
            text-foreground
            rounded-xl
            px-4 py-3
            font-mono text-sm
            border-2 border-border
            focus:border-primary
            focus:ring-2 focus:ring-primary/30
            outline-none
            transition-all
            resize-y
            min-h-[80px]
            max-h-[200px]
          "
          placeholder="Enter input..."
        />
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-1 font-mono">
          Output
        </label>
        <textarea
          ref={outputRef}
          value={testcase.output}
          onChange={(e) => handleChange("output", e.target.value)}
          className="
            w-full
            bg-background
            text-foreground
            rounded-xl
            px-4 py-3
            font-mono text-sm
            border-2 border-border
            focus:border-primary
            focus:ring-2 focus:ring-primary/30
            outline-none
            transition-all
            resize-y
            min-h-[80px]
            max-h-[200px]
          "
          placeholder="Enter expected output..."
        />
      </div>
    </div>
  </div>
)

  },
)

TestcaseRow.displayName = "TestcaseRow"
