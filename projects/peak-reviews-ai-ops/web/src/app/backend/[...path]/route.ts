import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
  const { path } = await context.params;
  const baseUrl = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
  const targetUrl = new URL(path.map(encodeURIComponent).join("/"), baseUrl);
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("accept-encoding");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("host");

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });

    const responseHeaders = new Headers();
    for (const name of ["content-language", "content-type", "location"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    responseHeaders.set("cache-control", "no-store");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json({ message: "The API is temporarily unavailable." }, { status: 502 });
  }
}

export {
  proxyRequest as DELETE,
  proxyRequest as GET,
  proxyRequest as HEAD,
  proxyRequest as OPTIONS,
  proxyRequest as PATCH,
  proxyRequest as POST,
  proxyRequest as PUT,
};
