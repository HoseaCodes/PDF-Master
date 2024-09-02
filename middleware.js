import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Define routes that require authentication
  const protectedRoutes = ["/dashboard", "/profile", "/settings"];

  // If user is accessing a protected route and is not authenticated
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    // Redirect to sign-in page
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  // Continue to the requested page if authenticated or accessing public routes
  return NextResponse.next();
}

// Apply middleware to all routes by default
export const config = {
  matcher: "/:path*",
};
