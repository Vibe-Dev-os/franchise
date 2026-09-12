import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/models/User";

const ADMIN_ONLY = ["/settings"];
const ADMIN_AND_FRANCHISING = ["/operators", "/drivers", "/vehicles", "/franchises", "/reports"];
const ADMIN_AND_ENFORCEMENT = ["/enforcement"];

function isAllowed(pathname: string, role: UserRole): boolean {
  if (role === "admin") return true;

  if (ADMIN_ONLY.some((p) => pathname.startsWith(p))) return false;

  if (ADMIN_AND_FRANCHISING.some((p) => pathname.startsWith(p))) {
    // Enforcement officers get read-only access to franchise records.
    if (pathname.startsWith("/franchises")) return role === "franchising_officer" || role === "enforcement_officer";
    return role === "franchising_officer";
  }

  if (ADMIN_AND_ENFORCEMENT.some((p) => pathname.startsWith(p))) {
    return role === "enforcement_officer";
  }

  // /dashboard, /violations and everything else: any authenticated role.
  return true;
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = token?.role as UserRole | undefined;
    const { pathname } = req.nextUrl;

    if (role && !isAllowed(pathname, role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/operators/:path*",
    "/drivers/:path*",
    "/vehicles/:path*",
    "/franchises/:path*",
    "/enforcement/:path*",
    "/violations/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
