import TestcaseZipUpload from "../testcases/TestcaseZipUpload";
import { TestcasePreviewList } from "../testcases/TestcasePreviewList";

export const TestcaseImportBlock = ({ title, testcases, onImport, onApply }) => {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-5 transition-all">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a ZIP file containing input/ and output/ folders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TestcaseZipUpload onSuccess={onImport} />

        </div>
      </div>

      {/* Limits */}
      <div className="text-xs text-muted-foreground bg-muted/40 dark:bg-muted/20 border border-border rounded-xl px-4 py-3">
        Max 4 sample testcases • Max 20 hidden testcases • Continuous numbering required (input1.txt → output1.txt)
      </div>

      {/* Preview Count */}
      {testcases && (
        <div className="text-sm font-medium text-foreground">
          Parsed {testcases.length} testcase(s)
        </div>
      )}

      {/* Preview */}
      {testcases && testcases.length > 0 && (
        <>
          <TestcasePreviewList testcases={testcases} />

          <div className="pt-2">
            <button
              type="button"
              onClick={onApply}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Apply Imported Testcases
            </button>
          </div>
        </>
      )}
    </div>
  );
};

