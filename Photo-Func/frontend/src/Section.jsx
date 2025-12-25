import { useState } from "react";
import Entry from "./Entry";

export default function Section({ section, onUpdate, onDelete }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Add a new entry
  const addEntry = () => {
    onUpdate({
      ...section,
      entries: [
        ...section.entries,
        {
          id: crypto.randomUUID(),
          images: { image1: null, image2: null },
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

  // Handle section deletion with confirmation
  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(section.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <label htmlFor={`section-title-${section.id}`} className="sr-only">
              Section Title
            </label>
            <input
              id={`section-title-${section.id}`}
              type="text"
              value={section.title}
              onChange={(e) =>
                onUpdate({ ...section, title: e.target.value })
              }
              placeholder="Enter section title..."
              className="w-full px-4 py-2 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              aria-label="Section title"
            />
          </div>
          <div className="flex items-center gap-2">
            {showDeleteConfirm ? (
              <>
                <button
                  onClick={handleDelete}
                  className="btn btn-danger text-sm px-3 py-1.5"
                  aria-label="Confirm delete section"
                >
                  <span className="material-icons mr-1 text-sm" aria-hidden="true">check</span>
                  Confirm
                </button>
                <button
                  onClick={cancelDelete}
                  className="btn-cancel"
                  aria-label="Cancel delete section"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleDelete}
                className="btn btn-danger text-sm px-3 py-1.5"
                aria-label="Delete section"
              >
                <span className="material-icons mr-1 text-sm" aria-hidden="true">delete</span>
                Delete Section
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div className="p-6 space-y-6">
        {section.entries.length > 0 ? (
          <div className="space-y-6">
            {section.entries.map((entry, index) => (
              <div key={entry.id} className="relative">
                {section.entries.length > 1 && (
                  <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-indigo-200 rounded-full" aria-hidden="true" />
                )}
                <Entry
                  entry={entry}
                  onUpdate={updateEntry}
                  onDelete={deleteEntry}
                  entryNumber={index + 1}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <span className="material-icons text-5xl mb-2 opacity-50" aria-hidden="true">photo_library</span>
            <p className="text-sm">No entries yet. Add your first entry below.</p>
          </div>
        )}

        {/* Add Entry Button */}
        <button
          onClick={addEntry}
          className="btn-add-entry w-full sm:w-auto"
          aria-label="Add new entry to section"
        >
          <span className="material-icons mr-2 text-lg" aria-hidden="true">add_photo_alternate</span>
          Add Entry
        </button>
      </div>
    </div>
  );
}
