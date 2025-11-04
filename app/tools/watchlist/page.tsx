import Link from 'next/link';

export default function WatchlistPage() {
  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/tools" className="text-decoration-none">Tools</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">My Watchlist</li>
        </ol>
      </nav>

      {/* Page Content */}
      <div className="text-center">
        <h1>Tool 5</h1>
      </div>
    </div>
  );
}