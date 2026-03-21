import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/",
    signOut: "/",
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name || null;
        token.userType = user.userType || null;
        logger.info({ userId: user.id }, "JWT token refreshed with user data");
      }
      return token;
    },
    async session({ session, token }) {
      const userId = token?.id as string | undefined;

      if (!userId) {
        logger.error({ token }, "No userId in JWT token");
        return session;
      }

      session.user.id = userId;
      session.user.name = (token?.name as string | null) || null;
      // Use userType from JWT token (stored in signin callback)
      session.user.userType = (token?.userType as string | null) || null;

      return session;
    },
  },
  events: {
    async signIn({ user }) {
      logger.info({ userId: user.id, email: user.email }, "User signed in");
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
