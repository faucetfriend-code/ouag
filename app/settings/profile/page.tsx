'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

// Force dynamic rendering to avoid issues with NextAuth during static generation
export const dynamic = 'force-dynamic';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.username || '');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <h1 className="mb-3">Profile Settings</h1>
          <p className="text-secondary mb-4">Please log in to access your profile settings.</p>
          <Link href="/login" className="btn btn-primary">
            <i className="bi bi-discord me-2"></i>
            Login with Discord
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: displayName || undefined,
          bio: bio || undefined,
          website: website || undefined,
          location: location || undefined,
          isPublic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/settings" className="text-decoration-none">Settings</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Profile
          </li>
        </ol>
      </nav>

      <div className="mb-4">
        <h1 className="mb-2">Profile Information</h1>
        <p className="text-secondary mb-0">Update your profile details and manage your public presence</p>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <form onSubmit={handleSave}>
            {/* Profile Picture Section */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-person-circle me-2"></i>
                  Profile Picture
                </h5>
              </div>
              <div className="card-body text-center">
                <div className="mb-3">
                  {user.avatar ? (
                    <img
                      src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`}
                      alt="Discord Avatar"
                      className="rounded-circle"
                      style={{ width: '120px', height: '120px' }}
                    />
                  ) : (
                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                         style={{ width: '120px', height: '120px', fontSize: '3rem', fontWeight: 'bold' }}>
                      {(user.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="text-secondary small mb-3">
                  Your profile picture is managed through Discord. Changes made on Discord will be reflected here automatically.
                </p>
                <button type="button" className="btn btn-outline-primary btn-sm" disabled>
                  <i className="bi bi-upload me-2"></i>
                  Upload Custom Picture (Coming Soon)
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-person-lines-fill me-2"></i>
                  Basic Information
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="displayName" className="form-label">Display Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    maxLength={50}
                  />
                  <div className="form-text">
                    This is how you&apos;ll appear to other users. Leave blank to use your Discord username.
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">Bio</label>
                  <textarea
                    className="form-control"
                    id="bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell others about yourself..."
                    maxLength={500}
                  />
                  <div className="form-text">
                    {bio.length}/500 characters
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="website" className="form-label">Website</label>
                  <input
                    type="url"
                    className="form-control"
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                  <div className="form-text">
                    Optional: Add a link to your personal website or social media.
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="location" className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    maxLength={100}
                  />
                  <div className="form-text">
                    Optional: Share your general location.
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-eye-slash me-2"></i>
                  Privacy Settings
                </h5>
              </div>
              <div className="card-body">
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="isPublic">
                    <strong>Public Profile</strong>
                    <br />
                    <small className="text-secondary">
                      Allow other users to view your profile, trading activity, and followed analysts.
                      {isPublic ? ' Your profile is currently visible to everyone.' : ' Your profile is currently private.'}
                    </small>
                  </label>
                </div>

                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Privacy Note:</strong> Even with a private profile, your username and basic trading activity may still be visible in public feeds and analytics.
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Profile Tips</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6><i className="bi bi-person-check text-success me-2"></i>Complete Your Profile</h6>
                <p className="small text-secondary mb-3">
                  Add a bio and website to help others understand your trading style and background.
                </p>
              </div>
              <div className="mb-3">
                <h6><i className="bi bi-shield-check text-info me-2"></i>Privacy Control</h6>
                <p className="small text-secondary mb-3">
                  You can always change your privacy settings later. Start public to connect with the community.
                </p>
              </div>
              <div className="mb-3">
                <h6><i className="bi bi-discord text-primary me-2"></i>Discord Integration</h6>
                <p className="small text-secondary mb-0">
                  Your Discord avatar and username are automatically synced with your profile.
                </p>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-body text-center">
              <Link href="/settings" className="btn btn-outline-primary w-100">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}