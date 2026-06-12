export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-dark">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-primary mb-4">404</h1>
        <p className="text-text-secondary mb-8">Page not found</p>
        <a href="/" className="px-6 py-2 bg-primary text-dark font-bold rounded-lg hover:opacity-90">
          Go Home
        </a>
      </div>
    </div>
  );
}
