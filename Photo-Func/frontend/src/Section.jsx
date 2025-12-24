import Entry from "./Entry";

export default function Section({ section, onUpdate, onDelete }) {
  // Add a new entry
  const addEntry = () => {
    onUpdate({
      ...section,
      entries: [
        ...section.entries,
        {
          id: crypto.randomUUID(),
          images: { image1: null, image2: null }, // new backend-aware
          footers: ["", ""],
        },
      ],
    });
  };

  // Update a specific entry
  const updateEntry = (entry) => {
    onUpdate({
      ...section,
      entries: section.entries.map((e) =>
        e.id === entry.id ? entry : e
      ),
    });
  };

  // Delete a specific entry
  const deleteEntry = (id) => {
    onUpdate({
      ...section,
      entries: section.entries.filter((e) => e.id !== id),
    });
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 10, marginBottom: 20 }}>
      <div style={{ marginBottom: 10 }}>
        <input
          value={section.title}
          onChange={(e) =>
            onUpdate({ ...section, title: e.target.value })
          }
          placeholder="Section header"
        />
        <button onClick={() => onDelete(section.id)} style={{ marginLeft: 10 }}>
          Delete Section
        </button>
      </div>

      {section.entries.map((entry) => (
        <Entry
          key={entry.id}
          entry={entry}
          onUpdate={updateEntry}
          onDelete={deleteEntry}
        />
      ))}

      <button onClick={addEntry} style={{ marginTop: 10 }}>
        ➕ Add Entry
      </button>
    </div>
  );
}
