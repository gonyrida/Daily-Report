// src/components/SuccessMessage.jsx
export default function SuccessMessage({ show }) {
  if (!show) return null;

  return (
    <div
      className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-sm animate-fade-in"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center">
        <span className="material-icons text-green-500 mr-3" aria-hidden="true">
          check_circle
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-800">
            Export successful! Your file has been downloaded.
          </p>
        </div>
      </div>
    </div>
  );
}