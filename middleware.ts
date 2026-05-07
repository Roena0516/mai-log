import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (!session?.user?.id) return NextResponse.next();

  const username = (session.user as any).username;
  if (username === null && pathname !== "/setup" && !pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/setup", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|favicon\\.ico|api/auth).*)"],
};
