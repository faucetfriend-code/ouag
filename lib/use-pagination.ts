/**
 * Pagination Hook
 *
 * Custom hook for managing pagination state and logic.
 * Provides current page, page size, and pagination controls.
 */

'use client';

import { useState, useMemo } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  currentData: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

/**
 * Hook for managing paginated data
 * @param data - The full array of data to paginate
 * @param options - Configuration options (initialPage, pageSize)
 */
export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { initialPage = 1, pageSize = 10 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);

  // Calculate total pages
  const totalPages = Math.ceil(data.length / pageSize);

  // Get current page data
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  // Calculate indices for display
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, data.length);

  // Navigation functions
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Navigation state
  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  return {
    currentPage,
    pageSize,
    totalPages,
    currentData,
    goToPage,
    nextPage,
    previousPage,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
    totalItems: data.length,
  };
}
