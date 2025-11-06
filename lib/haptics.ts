/**
 * Haptic Feedback Utilities
 *
 * Provides haptic feedback for touch interactions on mobile devices.
 * Uses Capacitor Haptics plugin with fallbacks for web.
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// Check if running on a device that supports haptics
const isHapticsSupported = async (): Promise<boolean> => {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
    return true;
  } catch {
    return false;
  }
};

let hapticsEnabled = false;

// Initialize haptics support
isHapticsSupported().then(supported => {
  hapticsEnabled = supported;
}).catch(() => {
  hapticsEnabled = false;
});

/**
 * Light impact feedback for subtle interactions
 */
export const lightImpact = async (): Promise<void> => {
  if (!hapticsEnabled) return;

  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (error) {
    console.warn('Haptics not supported:', error);
  }
};

/**
 * Medium impact feedback for button presses
 */
export const mediumImpact = async (): Promise<void> => {
  if (!hapticsEnabled) return;

  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (error) {
    console.warn('Haptics not supported:', error);
  }
};

/**
 * Heavy impact feedback for significant actions
 */
export const heavyImpact = async (): Promise<void> => {
  if (!hapticsEnabled) return;

  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (error) {
    console.warn('Haptics not supported:', error);
  }
};

/**
 * Success notification feedback
 */
export const successNotification = async (): Promise<void> => {
  if (!hapticsEnabled) return;

  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch (error) {
    console.warn('Haptics not supported:', error);
  }
};

/**
 * Error notification feedback
 */
export const errorNotification = async (): Promise<void> => {
  if (!hapticsEnabled) return;

  try {
    await Haptics.notification({ type: NotificationType.Error });
  } catch (error) {
    console.warn('Haptics not supported:', error);
  }
};

/**
 * Warning notification feedback
 */
export const warningNotification = async (): Promise<void> => {
  if (!hapticsEnabled) return;

  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch (error) {
    console.warn('Haptics not supported:', error);
  }
};

/**
 * Selection feedback for toggles and switches
 */
export const selectionFeedback = async (): Promise<void> => {
  if (!hapticsEnabled) return;

  try {
    await Haptics.selectionStart();
  } catch (error) {
    console.warn('Haptics not supported:', error);
  }
};