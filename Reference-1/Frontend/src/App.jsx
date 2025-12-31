import { exportPDF, exportExcel } from "./services/exportService"; // adjust import
import { useAppLogic } from "./hooks/useAppLogic";
import Header from "./components/Header";
import ErrorMessage from "./components/ErrorMessage";
import SuccessMessage from "./components/SuccessMessage";
import SectionList from "./components/SectionList";
import ActionToolbar from "./components/ActionToolbar/ActionToolbar";

export default function App() {
  const {
    sections,
    tableTitle,
    setTableTitle,
    isExporting,
    exportError,
    exportSuccess,
    addSection,
    updateSection,
    deleteSection,
    handleSubmit,
    clearError
  } = useAppLogic();

  // New handler for PDF export
  const handleExportPDF = () => {
    exportPDF(sections);
  };

  // Optional: handler for Export All
  const handleExportAll = () => {
    exportExcel(sections);  // triggers Excel download
    exportPDF(sections);    // triggers PDF download
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header />
        <ErrorMessage message={exportError} onDismiss={clearError} />
        <SuccessMessage show={exportSuccess} />
        <div className="mb-6">
          <label htmlFor="tableTitle" className="block text-sm font-medium text-gray-700 mb-1">Table Title</label>
          <input
            id="tableTitle"
            type="text"
            value={tableTitle}
            onChange={(e) => setTableTitle(e.target.value)}
            placeholder="Enter table title..."
            className="w-full px-3 py-2 border rounded-md text-lg font-semibold bg-white"
            aria-label="Table title"
          />
          <p className="text-xs text-gray-500 mt-1">This title is visual-only for now and is not sent to exports.</p>
        </div>

        <SectionList 
          sections={sections}
          onUpdate={updateSection}
          onDelete={deleteSection}
          onAdd={addSection}
        />
        <ActionToolbar 
          onAdd={addSection}
          onExport={handleSubmit}      // Excel
          onExportPDF={handleExportPDF} // PDF
          onExportAll={handleExportAll} // Both
          isExporting={isExporting}
          hasSections={sections.length > 0}
        />
      </div>
    </div>
  );
}
