export const TestcasePreviewList = ({ testcases }) => {
  if (!testcases || testcases.length === 0) return null

  return (
    <div className="space-y-4 mt-4">
      {testcases.map((tc) => (
        <div key={tc.order} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="text-sm font-mono text-muted-foreground mb-3 tracking-wide">
            Testcase #{tc.order}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Input
              </div>
              <pre className="bg-muted/40 dark:bg-muted/20 border border-border rounded-xl p-4 text-sm text-foreground overflow-auto whitespace-pre-wrap break-words">
                {tc.input}
              </pre>
            </div>

            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Output
              </div>
              <pre className="bg-muted/40 dark:bg-muted/20 border border-border rounded-xl p-4 text-sm text-foreground overflow-auto whitespace-pre-wrap break-words">
                {tc.output}
              </pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

}
