import { NextResponse, type NextRequest } from "next/server";
import { checkVpnForRequest } from "@/app/lib/security/vpn-check";

const VPN_RESTRICTED_PATH = "/vpn-restricted";
const VPN_REACH_API = "/api/security/vpn-reachability";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipVpnCheck(pathname)) {
    return NextResponse.next();
  }

  const result = await checkVpnForRequest(request);

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
  if (pathname === VPN_RESTRICTED_PATH || pathname.startsWith(`${VPN_RESTRICTED_PATH}/`)) {
    return true;
  }
  if (pathname === VPN_REACH_API || pathname.startsWith(`${VPN_REACH_API}/`)) {
    return true;
  }
  return false;
}
