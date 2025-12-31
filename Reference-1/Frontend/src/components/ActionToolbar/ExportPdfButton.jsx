export default function ExportPdfButton({ onExportPDF, isExporting, hasSections }) {
  const handleExportPDF = onExportPDF || (() => {});

  return (
    <button
      className="btn btn-secondary w-full sm:w-auto px-6 py-3 text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      onClick={handleExportPDF}
      disabled={isExporting || !hasSections}
      aria-label="Export to PDF"
    >
      <span className="material-icons mr-2 text-lg" aria-hidden="true">picture_as_pdf</span>
      Export PDF
    </button>
  );
}
