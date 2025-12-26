// src/components/SectionList.jsx
import Section from "../Section"

export default function SectionList({ sections, onUpdate, onDelete, onAdd }) {
  return (
    <div className="space-y-6 mb-8">
      {sections.length > 0 ? (
        sections.map((section) => (
          <Section
            key={section.id}
            section={section}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <span className="material-icons text-6xl text-gray-400 mb-4" aria-hidden="true">
            folder_open
          </span>
          <p className="text-gray-600 mb-4">No sections yet. Add your first section to get started.</p>
          <button 
            className="btn-add px-6 py-3 text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200" 
            onClick={onAdd} 
            aria-label="Add first section"
          >
            <span className="material-icons mr-2 text-lg" aria-hidden="true">add_circle</span>
            Add Section
          </button>
        </div>
      )}
    </div>
  );
}