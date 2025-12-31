export default function ExportAllButton({ onExportAll, isExporting, hasSections }) {
  const handleExportAll = onExportAll || (() => {});

  return (
    <button
      className="btn btn-secondary w-full sm:w-auto px-6 py-3 text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      onClick={handleExportAll}
      disabled={isExporting || !hasSections}
      aria-label="Export all formats"
    >
      <span className="material-icons mr-2 text-lg" aria-hidden="true">folder_open</span>
      Export All
    </button>
  );
}
