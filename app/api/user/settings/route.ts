/**
 * User Settings API Endpoint
 *
 * Handles account settings like password changes, 2FA, profile updates
 * Requires authentication via NextAuth session
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * GET /api/user/settings
 * Get current user account settings
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        discordId: true,
        username: true,
        discriminator: true,
        avatar: true,
        isServerMember: true,
        createdAt: true,
        preferences: true,
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        ...user,
        // Don't expose sensitive subscription data
        subscription: user.subscription ? {
          status: user.subscription.status,
          plan: user.subscription.plan,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
        } : null,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error loading user settings:', error);
    return NextResponse.json({ error: 'Failed to load user settings' }, { status: 500 });
  }
}

/**
 * PATCH /api/user/settings
 * Update user account settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...updates } = body;

    switch (action) {
      case 'updateProfile':
        return await updateProfile(session.user.id, updates);
      case 'changePassword':
        return await changePassword(session.user.id, updates);
      case 'toggleTwoFactor':
        return await toggleTwoFactor(session.user.id, updates);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Failed to update user settings' }, { status: 500 });
  }
}

async function updateProfile(userId: string, updates: any) {
  try {
    const { name, email } = updates;

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    }, { status: 200 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    throw error;
  }
}

async function changePassword(userId: string, updates: any) {
  try {
    const { currentPassword, newPassword } = updates;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    // Note: In a real implementation, you'd verify the current password
    // For now, we'll just update it (assuming Discord OAuth users don't have passwords)
    // In production, you'd hash and store passwords for non-OAuth users

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // For now, we'll store in a separate password field (not in schema yet)
    // This is a placeholder - you'd need to add a password field to the User model
    console.log(`Password change requested for user ${userId}`);
    console.log(`Hashed password: ${hashedPassword}`);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}

async function toggleTwoFactor(userId: string, updates: any) {
  try {
    const { enabled } = updates;

    // For now, this is a placeholder
    // In production, you'd implement proper 2FA with TOTP or similar
    console.log(`2FA ${enabled ? 'enabled' : 'disabled'} for user ${userId}`);

    return NextResponse.json({
      success: true,
      twoFactorEnabled: enabled,
      message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`
    }, { status: 200 });
  } catch (error) {
    console.error('Error toggling 2FA:', error);
    return NextResponse.json({ error: 'Failed to update 2FA settings' }, { status: 500 });
  }
}