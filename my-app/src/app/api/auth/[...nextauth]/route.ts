import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { UserType } from "@prisma/client";
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
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/",
    signOut: "/",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return true;

      // Verify user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (existingUser && !existingUser.name) {
        // Update user with name if missing
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { name: user.name },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name || null;
        token.userType = user.userType || null;
        logger.info({ userId: user.id }, "JWT token refreshed with user data");
      } else if (token?.id) {
        // Refresh userType from database if not in user object
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { userType: true },
        });
        if (dbUser?.userType) {
          token.userType = dbUser.userType;
        }
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
      session.user.userType = (token?.userType as UserType | null) || null;

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
