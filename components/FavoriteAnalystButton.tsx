'use client';

/**
 * Favorite Analyst Button Component
 *
 * Allows users to favorite/unfavorite analysts
 * Shows current favorite status with heart icon
 * Updates preferences in real-time
 */

import { useUserPreferences } from '@/lib/user-preferences-context';
import { useState } from 'react';

interface FavoriteAnalystButtonProps {
  username: string;
  variant?: 'default' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
}

export default function FavoriteAnalystButton({
  username,
  variant = 'default',
  size = 'md',
}: FavoriteAnalystButtonProps) {
  const { isFavorite, favoriteAnalyst, unfavoriteAnalyst } = useUserPreferences();
  const [isLoading, setIsLoading] = useState(false);
  const favorited = isFavorite(username);

  const handleToggleFavorite = async () => {
    setIsLoading(true);
    try {
      if (favorited) {
        await unfavoriteAnalyst(username);
      } else {
        await favoriteAnalyst(username);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Size classes
  const buttonSizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  // Icon-only variant
  if (variant === 'icon-only') {
    return (
      <button
        className={`btn ${favorited ? 'btn-danger' : 'btn-outline-danger'} ${buttonSizeClass}`}
        onClick={handleToggleFavorite}
        disabled={isLoading}
        title={favorited ? `Unfollow @${username}` : `Follow @${username}`}
      >
        {isLoading ? (
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        ) : (
          <i className={`bi ${favorited ? 'bi-heart-fill' : 'bi-heart'}`}></i>
        )}
      </button>
    );
  }

  // Default variant with text
  return (
    <button
      className={`btn ${favorited ? 'btn-danger' : 'btn-outline-primary'} ${buttonSizeClass}`}
      onClick={handleToggleFavorite}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {favorited ? 'Unfollowing...' : 'Following...'}
        </>
      ) : (
        <>
          <i className={`bi ${favorited ? 'bi-heart-fill' : 'bi-heart'} me-2`}></i>
          {favorited ? 'Following' : 'Follow'}
        </>
      )}
    </button>
  );
}
