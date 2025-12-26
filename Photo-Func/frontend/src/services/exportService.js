// src/services/exportService.js

export const prepareFormData = (sections) => {
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

  // Append all image files
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

  return formData;
};

export const downloadBlob = (blob) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `daily-report-${new Date().toISOString().split("T")[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};