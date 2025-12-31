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

// export const downloadBlob = (blob) => {
//   const url = window.URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = `daily-report-${new Date().toISOString().split("T")[0]}.xlsx`;
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
//   window.URL.revokeObjectURL(url);
// };

// Updated downloadBlob to accept filename
export const downloadBlob = (blob, filename) => {
  console.log("⬇️ downloadBlob filename:", filename);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const exportPDF = async (sections) => {
  try {
    const formData = prepareFormData(sections);

    const response = await fetch("http://localhost:5000/export_pdf", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to export PDF");
    }

    const blob = await response.blob();
    downloadBlob(blob, `daily-report-${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("PDF export error:", error);
    alert("Failed to export PDF. Check console for details.");
  }
};

export const exportExcel = async (sections) => {
  try {
    console.log("🔥 exportExcel CALLED");
    const formData = prepareFormData(sections);

    const response = await fetch("http://localhost:5000/export", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to export Excel");
    }

    const blob = await response.blob();
    const filename = `daily-report-${new Date().toISOString().split("T")[0]}.xlsx`;
    console.log("📁 Excel filename:", filename);
    downloadBlob(blob, filename);

  } catch (error) {
    console.error("Excel export error:", error);
    alert("Failed to export Excel. Check console for details.");
  }
};
