import { NextResponse, type NextRequest } from "next/server";
import { checkVpnAccess, getRequestIp } from "@/app/lib/security/vpn-check";

const VPN_RESTRICTED_PATH = "/vpn-restricted";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipVpnCheck(pathname)) {
    return NextResponse.next();
  }

  const ip = getRequestIp(request);

  if (!ip) {
    return NextResponse.next();
  }

  const result = await checkVpnAccess(ip);

  if (!result.blocked) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.json(
      { error: "Доступ под VPN или прокси ограничен" },
      { status: 403 },
    );
  }

  const url = request.nextUrl.clone();
  url.pathname = VPN_RESTRICTED_PATH;
  url.search = "";

  const response = NextResponse.redirect(url);
  response.headers.set("x-vpn-block-reason", result.reason ?? "restricted");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};

function shouldSkipVpnCheck(pathname: string) {
  return pathname === VPN_RESTRICTED_PATH || pathname.startsWith(`${VPN_RESTRICTED_PATH}/`);
}
