import { useState } from "react";
import Section from "./Section";

function createSection() {
  return {
    id: crypto.randomUUID(),
    title: "New Section",
    entries: [
      {
        id: crypto.randomUUID(),
        images: { image1: null, image2: null },
        footers: ["", ""],
      },
    ],
  };
}

export default function App() {
  const [sections, setSections] = useState([createSection()]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const addSection = () => {
    setSections([...sections, createSection()]);
  };

  const updateSection = (updated) => {
    setSections(sections.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteSection = (id) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleSubmit = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);

    // Validate that at least one section has content
    const hasContent = sections.some(
      (section) =>
        section.title.trim() &&
        section.entries.some(
          (entry) =>
            (entry.images.image1 || entry.images.image2) ||
            entry.footers.some((footer) => footer.trim())
        )
    );

    if (!hasContent) {
      setExportError("Please add at least one section with content before exporting.");
      setIsExporting(false);
      return;
    }

    const formData = new FormData();

    // Build JSON for backend
    const jsonSections = sections.map((section) => ({
      title: section.title,
      entries: section.entries.map((entry) => ({
        images: Object.keys(entry.images).map((key) => `${entry.id}_${key}`),
        footers: entry.footers,
      })),
    }));

    formData.append("data", JSON.stringify(jsonSections));

    // Append all image files to FormData with unique keys per entry
    sections.forEach((section) =>
      section.entries.forEach((entry) =>
        Object.entries(entry.images).forEach(([key, file]) => {
          if (file) {
            const uniqueKey = `${entry.id}_${key}`;
            formData.append(uniqueKey, file);
          }
        })
      )
    );

    try {
      const res = await fetch("http://127.0.0.1:5000/export", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to export Excel");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daily-report-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err) {
      console.error("Export error:", err);
      setExportError(
        err.message || "Export failed. Please check your connection and try again."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
            Daily Report Builder
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create and manage your photo entries with sections. Export to Excel when ready.
          </p>
        </header>

        {/* Error Message */}
        {exportError && (
          <div
            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start">
              <span className="material-icons text-red-500 mr-3" aria-hidden="true">
                error
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">
                  Export Error
                </h3>
                <p className="text-sm text-red-700">{exportError}</p>
              </div>
              <button
                onClick={() => setExportError(null)}
                className="ml-4 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                aria-label="Dismiss error message"
              >
                <span className="material-icons text-sm" aria-hidden="true">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {exportSuccess && (
          <div
            className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-sm animate-fade-in"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-center">
              <span className="material-icons text-green-500 mr-3" aria-hidden="true">
                check_circle
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800">
                  Export successful! Your file has been downloaded.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-6 mb-8">
          {sections.length > 0 ? (
            sections.map((section) => (
              <Section
                key={section.id}
                section={section}
                onUpdate={updateSection}
                onDelete={deleteSection}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <span className="material-icons text-6xl text-gray-400 mb-4" aria-hidden="true">
                folder_open
              </span>
              <p className="text-gray-600 mb-4">No sections yet. Add your first section to get started.</p>
              <button className="btn-add px-6 py-3 text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200" onClick={addSection} aria-label="Add first section">
                <span className="material-icons mr-2 text-lg" aria-hidden="true">add_circle</span>
                Add Section
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            className="btn-add w-full sm:w-auto px-6 py-3 text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            onClick={addSection}
            disabled={isExporting}
            aria-label="Add a new section"
          >
            <span className="material-icons mr-2 text-lg" aria-hidden="true">add_circle</span>
            Add Section
          </button>
          <button
            className="btn btn-secondary w-full sm:w-auto px-6 py-3 text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            onClick={handleSubmit}
            disabled={isExporting || sections.length === 0}
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
      </div>
    </div>
  );
}
