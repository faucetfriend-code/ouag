/**
 * Pagination Component
 *
 * Reusable pagination UI with page numbers, navigation buttons,
 * and item count display. Fully accessible with ARIA labels.
 */

'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalItems,
  className = '',
}: PaginationProps) {
  // Don't show pagination if there's only one page or no items
  if (totalPages <= 1) {
    return null;
  }

  // Calculate page numbers to show (max 5 visible page numbers)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 3) {
        // Near start: 1 2 3 4 ... 10
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end: 1 ... 7 8 9 10
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle: 1 ... 4 5 6 ... 10
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className={`d-flex flex-column flex-md-row justify-content-between align-items-center ${className}`}
      aria-label="Pagination navigation"
    >
      {/* Item count display */}
      <div className="mb-3 mb-md-0">
        <small className="text-secondary">
          Showing <strong>{startIndex}</strong> to <strong>{endIndex}</strong> of{' '}
          <strong>{totalItems}</strong> items
        </small>
      </div>

      {/* Pagination controls */}
      <ul className="pagination mb-0">
        {/* Previous button */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            <i className="bi bi-chevron-left" aria-hidden="true"></i>
            <span className="d-none d-sm-inline ms-1">Previous</span>
          </button>
        </li>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <li key={`ellipsis-${index}`} className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            );
          }

          const pageNum = page as number;
          return (
            <li
              key={pageNum}
              className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(pageNum)}
                aria-label={`Go to page ${pageNum}`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </button>
            </li>
          );
        })}

        {/* Next button */}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            <span className="d-none d-sm-inline me-1">Next</span>
            <i className="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
}
