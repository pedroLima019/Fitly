import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard/:path*",
  "/onboarding/:path*",
  "/api/client-requests/:path*",
  "/api/messages/:path*",
  "/api/profile/:path*",
  "/api/personals/:path*",
];

export const middleware = withAuth(
  function middleware(req: NextRequest) {
    // Additional custom logic can go here
    // For now, auth check is handled by withAuth
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        // Admin routes require admin role
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "admin";
        }

        // Protected routes require authentication
        const isProtected = protectedRoutes.some((route) => {
          const pattern = route.replace(":path*", "");
          return req.nextUrl.pathname.startsWith(pattern);
        });

        if (isProtected) {
          return !!token;
        }

        return true;
      },
    },
    pages: {
      signIn: "/",
      error: "/",
    },
  },
);

export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/api/client-requests/:path*",
    "/api/messages/:path*",
    "/api/profile/:path*",
    "/api/personals/:path*",
    // Auth routes
    "/api/auth/:path*",
  ],
};
