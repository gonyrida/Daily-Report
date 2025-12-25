import { useState } from "react";
import Section from "./Section";

function createSection() {
  return {
    id: crypto.randomUUID(),
    title: "New Section",
    entries: [
      {
        id: crypto.randomUUID(),
        images: { image1: null, image2: null }, // store File objects
        footers: ["", ""],
      },
    ],
  };
}

export default function App() {
  const [sections, setSections] = useState([createSection()]);

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
    const formData = new FormData();

    // Build JSON for backend
    const jsonSections = sections.map((section) => ({
      title: section.title,
      entries: section.entries.map((entry) => ({
        images: Object.keys(entry.images).map((key) => `${entry.id}_${key}`), // use the unique keys
        footers: entry.footers,
      })),
    }));

    formData.append("data", JSON.stringify(jsonSections));

    // Append all image files to FormData with unique keys per entry
    sections.forEach((section) =>
      section.entries.forEach((entry) =>
        Object.entries(entry.images).forEach(([key, file]) => {
          if (file) {
            const uniqueKey = `${entry.id}_${key}`; // <-- unique per entry
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

      if (!res.ok) throw new Error("Failed to export Excel");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "output.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Export failed. See console for details.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Sectioned Entry Form</h2>

      {sections.map((section) => (
        <Section
          key={section.id}
          section={section}
          onUpdate={updateSection}
          onDelete={deleteSection}
        />
      ))}

      <div style={{ marginTop: 20 }}>
        <button onClick={addSection}>➕ Add Section</button>
        <button onClick={handleSubmit} style={{ marginLeft: 10 }}>
          💾 Export Excel
        </button>
      </div>
    </div>
  );
}
