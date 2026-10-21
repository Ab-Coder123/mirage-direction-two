import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-2xl font-bold text-slate-800">404 - Page Not Found</h2>
      <p className="mt-2 text-sm text-slate-600">The requested admin resource could not be found.</p>
      <Link
        href="/"
        className="mt-4 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
