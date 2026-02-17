import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

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
        console.log("[jwt] Token updated with user:", {
          id: token.id,
          name: token.name,
        });
      } else {
        console.log("[jwt] No user, token as-is:", {
          id: token.id,
          sub: token.sub,
        });
      }
      return token;
    },
    async session({ session, token }) {
      const userId = token?.id || token?.sub;

      if (!userId) {
        console.error("[session] Erro: sem userId no token", {
          id: token?.id,
          sub: token?.sub,
        });
        return session;
      }

      session.user.id = userId as string;
      session.user.name = (token?.name as string | null) || null;

      // Buscar userType do banco para garantir que está atualizado
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId as string },
          select: { userType: true },
        });
        session.user.userType = user?.userType || null;
      } catch (error) {
        console.error("[session] Erro ao buscar userType:", error);
      }

      return session;
    },
  },
  events: {
    async signIn({ user }) {
      console.log("✓ User signed in:", user.id, user.email);
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
