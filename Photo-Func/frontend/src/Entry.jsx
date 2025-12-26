import { useEntryLogic } from "./hooks/useEntryLogic";
import ImageUploadArea from "./components/ImageUploadArea";

export default function Entry({ entry, onUpdate, onDelete, entryNumber }) {
  // Capture the entire object returned by the hook
  const logic = useEntryLogic(entry, onUpdate);

  return (
    <div className="relative mb-12 last:mb-0">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Entry {entryNumber}
        </h3>
        <button 
          onClick={() => onDelete(entry.id)} 
          className="text-red-500 hover:text-red-700 transition-colors"
          title="Delete Entry"
        >
          <span className="material-icons">delete</span>
        </button>
      </div>

      {/* GRID SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo 1 */}
        <ImageUploadArea
          label="Photo 1"
          imageKey="image1"
          footerIndex={0}
          entry={entry}
          imageUrl={logic.imageUrls.image1}
          isDragActive={logic.dragActive.image1}
          {...logic} // Passes handleImageChange, handleDrag, handleDrop, removeImage, etc.
        />

        {/* Photo 2 */}
        <ImageUploadArea
          label="Photo 2"
          imageKey="image2"
          footerIndex={1}
          entry={entry}
          imageUrl={logic.imageUrls.image2}
          isDragActive={logic.dragActive.image2}
          {...logic} // Passes all the same logic functions here too
        />
      </div>
    </div>
  );
}