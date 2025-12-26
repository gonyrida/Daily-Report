import { useAppLogic } from "./hooks/useAppLogic";
import Header from "./components/Header";
import ErrorMessage from "./components/ErrorMessage";
import SuccessMessage from "./components/SuccessMessage";
import SectionList from "./components/SectionList";
import ActionToolbar from "./components/ActionToolbar";

export default function App() {
  const {
    sections,
    isExporting,
    exportError,
    exportSuccess,
    addSection,
    updateSection,
    deleteSection,
    handleSubmit,
    clearError
  } = useAppLogic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header />

        <ErrorMessage 
          message={exportError} 
          onDismiss={clearError} 
        />

        <SuccessMessage show={exportSuccess} />

        <SectionList 
          sections={sections}
          onUpdate={updateSection}
          onDelete={deleteSection}
          onAdd={addSection}
        />

        <ActionToolbar 
          onAdd={addSection}
          onExport={handleSubmit}
          isExporting={isExporting}
          hasSections={sections.length > 0}
        />
      </div>
    </div>
  );
}