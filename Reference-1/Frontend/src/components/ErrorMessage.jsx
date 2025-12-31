// src/components/ErrorMessage.jsx
export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <span className="material-icons text-red-500 mr-3" aria-hidden="true">
          error
        </span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-1">
            Export Error
          </h3>
          <p className="text-sm text-red-700">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="ml-4 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
          aria-label="Dismiss error message"
        >
          <span className="material-icons text-sm" aria-hidden="true">close</span>
        </button>
      </div>
    </div>
  );
}