const headerNames = Object.freeze([
  "X-Client-IP",
  "X-Forwarded-For",
  "HTTP-X-Forwarded-For",
  "Fly-Client-IP",
  "CF-Connecting-IP",
  "Fastly-Client-Ip",
  "True-Client-Ip",
  "X-Real-IP",
  "X-Cluster-Client-IP",
  "X-Forwarded",
  "Forwarded-For",
  "Forwarded",
  "DO-Connecting-IP" /** Digital ocean app platform */,
  "oxygen-buyer-ip" /** Shopify oxygen platform */,
] as const);

export function parseForwardedHeader(value: string | null): string | null {
  if (!value) return null;
  for (let part of value.split(";")) {
    if (part.startsWith("for=")) return part.slice(4);
    continue;
  }
  return null;
}

export function getClientIPAddress(headers: Headers) {
  let ipAddress = headerNames
    .flatMap((headerName) => {
      let value = headers.get(headerName);
      if (headerName === "Forwarded") {
        return parseForwardedHeader(value);
      }
      if (!value?.includes(",")) return value;
      return value.split(",").map((ip) => ip.trim());
    })
    .find((ip) => {
      if (ip === null) return false;
      return ip;
    });

  return ipAddress ?? undefined;
}
