import { checkVpnForRequest } from "@/app/lib/security/vpn-check";
import { NextResponse, type NextRequest } from "next/server";

const VPN_RESTRICTED_PATH = "/vpn-restricted";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_GEO_RESTRICT_IN_DEV !== "true"
  ) {
    return NextResponse.next();
  }

  if (shouldSkipVpnCheck(pathname)) {
    return NextResponse.next();
  }

  const result = await checkVpnForRequest(request);

  if (!result.blocked) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    const response = NextResponse.json(
      { error: "Доступ под VPN или прокси запрещен" },
      { status: 403 },
    );
    setRestrictionHeaders(response, result.reason, result.checkedIp);
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = VPN_RESTRICTED_PATH;
  url.search = "";

  const response = NextResponse.rewrite(url, { status: 403 });
  setRestrictionHeaders(response, result.reason, result.checkedIp);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};

function shouldSkipVpnCheck(pathname: string) {
  return pathname === VPN_RESTRICTED_PATH || pathname.startsWith(`${VPN_RESTRICTED_PATH}/`);
}

function setRestrictionHeaders(
  response: NextResponse,
  reason: string | undefined,
  checkedIp: string | undefined,
) {
  response.headers.set("x-vpn-block-reason", reason ?? "restricted");
  response.headers.set("x-vpn-checked-ip", checkedIp ?? "none");
}
