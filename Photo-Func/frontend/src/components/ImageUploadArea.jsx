export default function ImageUploadArea({ 
  label, 
  imageKey, 
  footerIndex, 
  entry, 
  imageUrl, 
  isDragActive, 
  fileInputRefs,
  handleDrag, 
  handleDrop, 
  handleImageChange, 
  removeImage, 
  handleFooterChange 
}) {
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
}