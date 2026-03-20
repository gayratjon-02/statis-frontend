import { NextRequest, NextResponse } from "next/server";

const ADMIN_DOMAIN = process.env.NEXT_PUBLIC_ADMIN_DOMAIN ?? "";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0] ?? "";
  const { pathname } = request.nextUrl;

  if (hostname === ADMIN_DOMAIN) {
    if (!pathname.startsWith("/_admin") && !pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
      const url = request.nextUrl.clone();
      url.pathname = `/_admin${pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/_admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
