import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { roleDefaultRoute } from "@/modules/auth/types";

// ── Session cookie decoding (duplicated from session.ts for edge compatibility) ──

function decodeSession(value: string | undefined): { role: string; roles?: string[] } | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(parts[0], "base64url").toString("utf8")
    ) as { role: string; roles?: string[] };
    if (!parsed.role) return null;
    return { role: parsed.role, roles: parsed.roles };
  } catch {
    return null;
  }
}

// ── Role-to-path mapping for cross-role guard ──
// Paths that are role-specific (prefix → allowed user role)
const rolePaths: Record<string, string> = {
  "/admin": "admin",
  "/staff": "staff",
  "/candidate": "candidate",
  "/company": "company",
  "/employer": "company",
  "/inspector": "inspector",
};

const publicPaths = [
  "/login",
  "/signup",
  "/",
  "/games",
  "/for",
  "/for-candidates",
  "/forgot-password",
  "/reset-password",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("studenthub_next_session");
  const isAuthenticated = Boolean(sessionCookie?.value);

  // Allow public paths
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/dev/impersonate")
  ) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Cross-role guard ──
  // After confirming the user is authenticated, decode the session role
  // and verify they aren't accessing another role's route prefix.
  const session = decodeSession(sessionCookie?.value);

  // Check if the current path matches a role-specific prefix
  for (const [prefix, allowedRole] of Object.entries(rolePaths)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      // User is on a role-specific path — verify they have this role
      if (session) {
        const userRoles = session.roles ?? [session.role];
        if (!userRoles.includes(allowedRole)) {
          const loginUrl = new URL("/login", request.url);
          // Redirect to their correct default route
          loginUrl.searchParams.set(
            "redirect",
            roleDefaultRoute(session.role as any)
          );
          return NextResponse.redirect(loginUrl);
        }
      }
      break; // Found a match, no need to check further prefixes
    }
  }

  // Route authenticated users from / to their role-specific workspace
  if (pathname === "/") {
    if (session && session.role) {
      return NextResponse.redirect(new URL(roleDefaultRoute(session.role as any), request.url));
    }
  }

  // Add security headers for authenticated routes
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - API routes that don't need auth
     * - Static files
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
  ]
};
