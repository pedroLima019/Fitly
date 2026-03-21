import "next-auth";
import "next-auth/jwt";
import { UserType } from "@/src/generated/prisma";

declare module "next-auth" {
  interface User {
    id: string;
    userType: UserType | null;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      userType: UserType | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userType: UserType | null;
  }
}
