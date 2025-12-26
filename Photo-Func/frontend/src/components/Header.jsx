// src/components/Header.jsx
export default function Header() {
  return (
    <header className="text-center mb-10">
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
        Daily Report Builder
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Create and manage your photo entries with sections. Export to Excel when ready.
      </p>
    </header>
  );
}