import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, verifyToken } from "@/lib/auth";

const ADMIN_PATHS = ["/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is an admin path
  const isAdminPath = ADMIN_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  if (!isAdminPath) {
    return NextResponse.next();
  }

  // Allow login page
  if (pathname === "/admin/login") {
    const token = request.cookies.get("auth_token")?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
    return NextResponse.next();
  }

  // Check auth for other admin paths
  const token = request.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const response = NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
    response.cookies.delete("auth_token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
