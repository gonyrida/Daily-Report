import { useState, useRef, useEffect } from "react";

export default function Entry({ entry, onUpdate, onDelete, entryNumber }) {
  const [dragActive, setDragActive] = useState({ image1: false, image2: false });
  const [imageUrls, setImageUrls] = useState({ image1: null, image2: null });
  const fileInputRefs = {
    image1: useRef(null),
    image2: useRef(null),
  };

  // Create and cleanup image preview URLs
  useEffect(() => {
    const urls = { image1: null, image2: null };
    
    if (entry.images.image1) {
      urls.image1 = URL.createObjectURL(entry.images.image1);
    }
    if (entry.images.image2) {
      urls.image2 = URL.createObjectURL(entry.images.image2);
    }
    
    setImageUrls(urls);

    // Cleanup function
    return () => {
      if (urls.image1) URL.revokeObjectURL(urls.image1);
      if (urls.image2) URL.revokeObjectURL(urls.image2);
    };
  }, [entry.images.image1, entry.images.image2]);

  // Handle image file change
  const handleImageChange = (e, key) => {
    const file = e.target.files[0] || null;
    if (file && file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }
    onUpdate({
      ...entry,
      images: { ...entry.images, [key]: file },
    });
  };

  // Handle drag events
  const handleDrag = (e, key) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive({ ...dragActive, [key]: true });
    } else if (e.type === "dragleave") {
      setDragActive({ ...dragActive, [key]: false });
    }
  };

  // Handle drop
  const handleDrop = (e, key) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({ ...dragActive, [key]: false });

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        if (file.size > 10 * 1024 * 1024) {
          alert("File size must be less than 10MB");
          return;
        }
        onUpdate({
          ...entry,
          images: { ...entry.images, [key]: file },
        });
      }
    }
  };

  // Remove image
  const removeImage = (key, e) => {
    e.stopPropagation();
    onUpdate({
      ...entry,
      images: { ...entry.images, [key]: null },
    });
    if (fileInputRefs[key].current) {
      fileInputRefs[key].current.value = "";
    }
  };

  // Handle footer text change
  const handleFooterChange = (e, index) => {
    const newFooters = [...entry.footers];
    newFooters[index] = e.target.value;
    onUpdate({
      ...entry,
      footers: newFooters,
    });
  };

  const ImageUploadArea = ({ key, label, imageKey, footerIndex }) => {
    const imageUrl = imageUrls[imageKey];
    const isDragActive = dragActive[imageKey];

    return (
      <div className="flex flex-col group">
        <div
          onDragEnter={(e) => handleDrag(e, imageKey)}
          onDragLeave={(e) => handleDrag(e, imageKey)}
          onDragOver={(e) => handleDrag(e, imageKey)}
          onDrop={(e) => handleDrop(e, imageKey)}
          className={`
            relative w-full aspect-[4/3] overflow-hidden
            border-x border-t border-gray-300 dark:border-gray-600 rounded-t-lg
            transition-all duration-200
            bg-white dark:bg-gray-800
            ${isDragActive ? "scale-[1.02]" : ""}
            cursor-pointer shadow-sm group-hover:shadow-md
            focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2
          `}
          role="button"
          tabIndex={0}
          aria-label={`Upload ${label.toLowerCase()}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRefs[imageKey].current?.click();
            }
          }}
        >
          {imageUrl ? (
            <div className="relative w-full h-full group/image">
              <img
                src={imageUrl}
                alt={`Preview of ${label.toLowerCase()}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={(e) => removeImage(imageKey, e)}
                  className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-colors"
                  title="Remove Image"
                  aria-label={`Remove ${label.toLowerCase()}`}
                >
                  <span className="material-icons text-xl" aria-hidden="true">delete</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col justify-center items-center">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-4 mb-3 group-hover:scale-110 transition-transform duration-200">
                <span
                  className={`material-icons text-4xl transition-colors ${
                    isDragActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"
                  }`}
                  aria-hidden="true"
                >
                  {isDragActive ? "cloud_done" : "add_photo_alternate"}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Upload Image</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click or drag file</p>
            </div>
          )}
          <input
            id={`image-${imageKey}-${entry.id}`}
            ref={fileInputRefs[imageKey]}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, imageKey)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            aria-label={`Upload ${label.toLowerCase()}`}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-b-lg p-3">
          <label htmlFor={`footer-${footerIndex}-${entry.id}`} className="sr-only">
            Caption for {label.toLowerCase()}
          </label>
          <input
            id={`footer-${footerIndex}-${entry.id}`}
            type="text"
            placeholder="Enter caption..."
            value={entry.footers[footerIndex]}
            onChange={(e) => handleFooterChange(e, footerIndex)}
            className="w-full text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 transition-all min-h-[44px]"
            aria-label={`Caption for ${label.toLowerCase()}`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
      {entryNumber && (
        <div className="flex items-center mb-4 pb-3 border-b border-gray-200">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mr-3">
            {entryNumber}
          </span>
          <h3 className="text-sm font-medium text-gray-700">Entry {entryNumber}</h3>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-6">
        <ImageUploadArea
          key="image1"
          label="Image Column 1"
          imageKey="image1"
          footerIndex={0}
        />
        <ImageUploadArea
          key="image2"
          label="Image Column 2"
          imageKey="image2"
          footerIndex={1}
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={() => onDelete(entry.id)}
          className="btn btn-danger-sm"
          aria-label="Delete this entry"
        >
          <span className="material-icons mr-2 text-sm" aria-hidden="true">delete</span>
          Delete Entry
        </button>
      </div>
    </div>
  );
}
