'use client';

import { useCallback } from 'react';
import { useLoading } from './loading-context';

/**
 * Custom hook for handling async operations with global loading states
 *
 * @param asyncFn - The async function to execute
 * @param loadingMessage - Optional loading message to display
 * @returns A function that executes the async operation with loading state management
 */
export function useAsync<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  loadingMessage = 'Loading...'
) {
  const { startLoading, stopLoading } = useLoading();

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
      try {
        startLoading(loadingMessage);
        const result = await asyncFn(...args);
        return result;
      } catch (error) {
        console.error('Async operation failed:', error);
        throw error; // Re-throw so calling code can handle it
      } finally {
        stopLoading();
      }
    },
    [asyncFn, loadingMessage, startLoading, stopLoading]
  );

  return execute;
}

/**
 * Hook for handling multiple async operations with a single loading state
 */
export function useAsyncMultiple(loadingMessage = 'Loading...') {
  const { startLoading, stopLoading, setLoadingMessage } = useLoading();

  const executeMultiple = useCallback(
    async <T>(asyncOperations: Promise<T>[]): Promise<T[]> => {
      try {
        startLoading(loadingMessage);
        const results = await Promise.all(asyncOperations);
        return results;
      } catch (error) {
        console.error('Multiple async operations failed:', error);
        throw error;
      } finally {
        stopLoading();
      }
    },
    [loadingMessage, startLoading, stopLoading]
  );

  return { executeMultiple, setLoadingMessage };
}