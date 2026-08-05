import { NextRequest, NextResponse } from "next/server";
import { decryptSession } from "@/lib/session";

// Optimistic auth check only — reads the session cookie, does not hit the
// database. Route Handlers and Server Components re-verify via lib/dal.ts,
// which is the real authorization boundary.
const PROTECTED_PREFIXES = ["/dashboard", "/listings/new", "/listings/mine", "/admin"];
const AUTH_PAGES = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (!isProtected && !isAuthPage) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;
  const session = await decryptSession(token);

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtected && pathname.startsWith("/admin") && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/listings/new", "/listings/mine/:path*", "/admin/:path*", "/login", "/signup"],
};
