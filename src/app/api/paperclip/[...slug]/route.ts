/**
 * Paperclip API proxy route.
 *
 * Proxies /api/paperclip/* requests to the local Paperclip API server.
 * This works around Cloudflare Workers intercepting /api/* at the edge
 * and routing them to Next.js instead of through the tunnel to Paperclip.
 *
 * External usage:
 *   https://bot-sh-testing.studenthub.co/api/paperclip/companies/... -> Paperclip
 *
 * Next.js handles /api/paperclip/* (passes the Cloudflare Worker rule),
 * then we proxy to http://127.0.0.1:3101/api/{slug} (Paperclip API).
 *
 * Supports all HTTP methods: GET, POST, PUT, PATCH, DELETE
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PAPERCLIP_UPSTREAM = "http://127.0.0.1:3101";

/**
 * Forward headers that are safe and relevant to Paperclip.
 * Strips host and connection-level headers to avoid conflicts.
 */
function forwardHeaders(source: Headers): HeadersInit {
  const allowed = [
    "authorization",
    "content-type",
    "content-length",
    "x-paperclip-run-id",
    "x-paperclip-api-key",
    "user-agent",
    "accept",
    "accept-encoding",
    "accept-language",
    "referer",
    "origin",
    "cookie",
    "x-forwarded-for",
    "x-forwarded-proto",
    "x-real-ip",
  ];

  const headers: Record<string, string> = {};
  for (const key of allowed) {
    const value = source.get(key);
    if (value) {
      headers[key] = value;
    }
  }
  return headers;
}

/**
 * Proxy any HTTP method to the Paperclip upstream.
 */
async function proxyRequest(
  request: NextRequest,
  slug: string[],
  method: string,
): Promise<NextResponse> {
  // Rebuild the upstream URL path: /api/{slug}
  const upstreamPath = `/api/${slug.join("/")}`;

  // Build the upstream URL including query string
  const upstreamUrl = new URL(upstreamPath, PAPERCLIP_UPSTREAM);
  upstreamUrl.search = request.nextUrl.search;

  try {
    let body: BodyInit | undefined;

    // Only forward body for methods that support it
    if (["POST", "PUT", "PATCH"].includes(method)) {
      body = await request.clone().text().catch(() => undefined);
    }

    const response = await fetch(upstreamUrl.toString(), {
      method,
      headers: {
        ...forwardHeaders(request.headers),
      },
      body,
      // Don't follow redirects — let Paperclip's redirects through
      redirect: "manual",
    });

    // Read the response body
    const responseBody = await response.text();

    // Build the NextResponse with Paperclip's status and body
    const proxyResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
    });

    // Forward Paperclip's response headers
    const responseHeaders = [
      "content-type",
      "content-length",
      "cache-control",
      "etag",
      "location",
      "set-cookie",
    ];

    for (const key of responseHeaders) {
      const value = response.headers.get(key);
      if (value) {
        proxyResponse.headers.set(key, value);
      }
    }

    // Add CORS headers for browser-based API calls
    proxyResponse.headers.set("access-control-allow-origin", "*");
    proxyResponse.headers.set(
      "access-control-allow-methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    proxyResponse.headers.set(
      "access-control-allow-headers",
      "Content-Type, Authorization, X-Paperclip-Run-Id",
    );

    return proxyResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Paperclip proxy error: ${message}` },
      { status: 502 },
    );
  }
}

// ── HTTP method handlers ──

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  return proxyRequest(request, slug, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  return proxyRequest(request, slug, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  return proxyRequest(request, slug, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  return proxyRequest(request, slug, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  return proxyRequest(request, slug, "DELETE");
}
