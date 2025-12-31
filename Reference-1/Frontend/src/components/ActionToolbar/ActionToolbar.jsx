// // src/components/ActionToolbar.jsx
import ExportExcelButton from './ExportExcelButton';
import ExportPdfButton from './ExportPdfButton';
import ExportAllButton from './ExportAllButton';

export default function ActionToolbar({ onAdd, onExport, onExportPDF, onExportAll, isExporting, hasSections }) {
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

      <div className="flex w-full sm:w-auto items-center gap-3">
        <ExportExcelButton onExport={onExport} isExporting={isExporting} hasSections={hasSections} />
        <ExportPdfButton onExportPDF={onExportPDF} isExporting={isExporting} hasSections={hasSections} />
        <ExportAllButton onExportAll={onExportAll} isExporting={isExporting} hasSections={hasSections} />
      </div>
    </div>
  );
}
