// src/components/ActionToolbar.jsx
export default function ActionToolbar({ 
  onAdd, 
  onExport, 
  isExporting, 
  hasSections 
}) {
  return (
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
      <button
        className="btn-add w-full sm:w-auto px-6 py-3 text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        onClick={onAdd}
        disabled={isExporting}
        aria-label="Add a new section"
      >
        <span className="material-icons mr-2 text-lg" aria-hidden="true">add_circle</span>
        Add Section
      </button>

      <button
        className="btn btn-secondary w-full sm:w-auto px-6 py-3 text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        onClick={onExport}
        disabled={isExporting || !hasSections}
        aria-label="Export to Excel"
        aria-busy={isExporting}
      >
        {isExporting ? (
          <>
            <span className="material-icons mr-2 text-lg animate-spin" aria-hidden="true">
              hourglass_empty
            </span>
            Exporting...
          </>
        ) : (
          <>
            <span className="material-icons mr-2 text-lg" aria-hidden="true">file_download</span>
            Export Excel
          </>
        )}
      </button>
    </div>
  );
}