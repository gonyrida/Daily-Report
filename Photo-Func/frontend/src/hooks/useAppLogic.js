import { useState } from "react";
import { createSection, validateSections } from "../utils/sectionHelpers";
import { prepareFormData, downloadBlob } from "../services/exportService";

export function useAppLogic() {
  const [sections, setSections] = useState([createSection()]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const addSection = () => setSections([...sections, createSection()]);
  
  const updateSection = (updated) => 
    setSections(sections.map((s) => (s.id === updated.id ? updated : s)));

  const deleteSection = (id) => 
    setSections(sections.filter((s) => s.id !== id));

  const clearError = () => setExportError(null);

  const handleSubmit = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);

    if (!validateSections(sections)) {
      setExportError("Please add at least one section with content before exporting.");
      setIsExporting(false);
      return;
    }

    try {
      const formData = prepareFormData(sections);
      const res = await fetch("http://127.0.0.1:5000/export", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to export Excel");
      }

      const blob = await res.blob();
      downloadBlob(blob);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err) {
      console.error("Export error:", err);
      setExportError(err.message || "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    sections,
    isExporting,
    exportError,
    exportSuccess,
    addSection,
    updateSection,
    deleteSection,
    handleSubmit,
    clearError
  };
}