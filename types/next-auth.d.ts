import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      discordId: string;
      username: string;
      discriminator: string;
      avatar?: string;
      email?: string;
      isServerMember: boolean;
      subscription?: {
        active: boolean;
        endDate?: Date;
        plan?: string;
      };
    };
  }

  interface Profile {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
    email?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    discordId: string;
    username: string;
    discriminator: string;
    avatar?: string;
    email?: string;
    isServerMember: boolean;
  }
}