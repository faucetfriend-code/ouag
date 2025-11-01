import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

export const { handlers, auth, signIn, signOut } = NextAuth({
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
    async jwt({ token, account, profile }) {
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
              const guilds = await guildsResponse.json();
              // Replace with your actual Discord server ID
              const serverId = process.env.DISCORD_SERVER_ID!;
              token.isServerMember = guilds.some((guild: any) => guild.id === serverId);
            }
          } catch (error) {
            console.error('Failed to check server membership:', error);
            token.isServerMember = false;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.discordId = token.discordId as string;
        session.user.username = token.username as string;
        session.user.discriminator = token.discriminator as string;
        session.user.avatar = token.avatar as string;
        session.user.email = token.email as string;
        session.user.isServerMember = token.isServerMember as boolean;

        // Mock subscription data - replace with real subscription logic
        session.user.subscription = {
          active: Math.random() > 0.5, // Random for demo
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          plan: 'Premium',
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});