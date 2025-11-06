import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Account, Profile, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import DiscordProvider from 'next-auth/providers/discord';
import { prisma } from './prisma';

interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  owner: boolean;
  permissions: string;
  features: string[];
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify email guilds',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }: {
      token: JWT;
      account: Account | null;
      profile?: Profile;
    }) {
      if (account && profile) {
        token.discordId = profile.id;
        token.username = profile.username;
        token.discriminator = profile.discriminator;
        token.avatar = profile.avatar;
        token.email = profile.email;

        // Check if user is a member of the server
        if (account.access_token) {
          try {
            const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
              headers: {
                Authorization: `Bearer ${account.access_token}`,
              },
            });

            if (guildsResponse.ok) {
              const guilds: DiscordGuild[] = await guildsResponse.json();
              // Replace with your actual Discord server ID
              const serverId = process.env.DISCORD_SERVER_ID!;
              token.isServerMember = guilds.some((guild) => guild.id === serverId);
            }
          } catch (error) {
            console.error('Failed to check server membership:', error);
            token.isServerMember = false;
          }
        }
      }
      return token;
    },
    async session({ session, token }: {
      session: Session;
      token: JWT;
    }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.discordId = token.discordId as string;
        session.user.username = token.username as string;
        session.user.discriminator = token.discriminator as string;
        session.user.avatar = token.avatar as string;
        session.user.email = token.email as string;
        session.user.isServerMember = token.isServerMember as boolean;

        // Fetch real subscription data from database
        try {
          const subscription = await prisma.subscription.findUnique({
            where: { userId: token.sub! }
          });

          if (subscription) {
            session.user.subscription = {
              active: subscription.status === 'active',
              endDate: subscription.currentPeriodEnd || undefined,
              plan: subscription.plan,
            };
          } else {
            // Free tier for users without subscription
            session.user.subscription = {
              active: false,
              plan: 'free',
            };
          }
        } catch (error) {
          console.error('Error fetching subscription:', error);
          // Fallback to free tier
          session.user.subscription = {
            active: false,
            plan: 'free',
          };
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Backward compatibility for API routes
export const authOptions = authConfig;