import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface ProfileData {
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
  isPublic?: boolean;
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profileData: ProfileData = await request.json();

    // TODO: Validate and update user profile in database
    // Basic validation
    if (profileData.displayName && profileData.displayName.length > 50) {
      return NextResponse.json({ error: 'Display name must be 50 characters or less' }, { status: 400 });
    }

    if (profileData.bio && profileData.bio.length > 500) {
      return NextResponse.json({ error: 'Bio must be 500 characters or less' }, { status: 400 });
    }

    if (profileData.website && !profileData.website.match(/^https?:\/\/.+/)) {
      return NextResponse.json({ error: 'Website must be a valid URL' }, { status: 400 });
    }

    // TODO: Save to database
    console.log('Updating profile for user:', session.user.id, profileData);

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: profileData
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}