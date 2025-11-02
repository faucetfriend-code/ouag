/**
 * Toast Notification Utilities
 *
 * Provides convenient wrapper functions for showing toast notifications.
 * Use these instead of importing react-hot-toast directly for consistency.
 */

import toast from 'react-hot-toast';

/**
 * Show a success toast message
 * @param message - The success message to display
 */
export const showSuccess = (message: string) => {
  toast.success(message, {
    ariaProps: {
      role: 'status',
      'aria-live': 'polite',
    },
  });
};

/**
 * Show an error toast message
 * @param message - The error message to display
 */
export const showError = (message: string) => {
  toast.error(message, {
    ariaProps: {
      role: 'alert',
      'aria-live': 'assertive',
    },
  });
};

/**
 * Show an info toast message
 * @param message - The info message to display
 */
export const showInfo = (message: string) => {
  toast(message, {
    icon: 'ℹ️',
    ariaProps: {
      role: 'status',
      'aria-live': 'polite',
    },
  });
};

/**
 * Show a loading toast message and return the toast ID for dismissal
 * @param message - The loading message to display
 * @returns Toast ID for manual dismissal
 */
export const showLoading = (message: string) => {
  return toast.loading(message, {
    ariaProps: {
      role: 'status',
      'aria-live': 'polite',
    },
  });
};

/**
 * Dismiss a specific toast by ID
 * @param toastId - The ID of the toast to dismiss
 */
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all active toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};

/**
 * Show a promise-based toast (loading → success/error)
 * @param promise - The promise to track
 * @param messages - Object with loading, success, and error messages
 */
export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((err: Error) => string);
  }
) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      success: {
        ariaProps: {
          role: 'status',
          'aria-live': 'polite',
        },
      },
      error: {
        ariaProps: {
          role: 'alert',
          'aria-live': 'assertive',
        },
      },
    }
  );
};

/**
 * Show a custom toast with an icon
 * @param message - The message to display
 * @param icon - The emoji or icon to show
 */
export const showCustom = (message: string, icon: string) => {
  toast(message, {
    icon,
    ariaProps: {
      role: 'status',
      'aria-live': 'polite',
    },
  });
};
