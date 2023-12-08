function isObject(value: any) {
  return value !== null && typeof value === "object";
}

export function merge(...sources: HeadersInit[]) {
  const result: Record<string, string> = {};

  for (const source of sources) {
    if (!isObject(source)) {
      throw new TypeError("All arguments must be of type object");
    }

    const headers: Headers = new Headers(source);

    for (const [key, value] of headers.entries()) {
      if (value === undefined || value === "undefined") {
        delete result[key];
      } else {
        result[key] = value;
      }
    }
  }

  return new Headers(result);
}

/**
 * Combine multiple header objects into one (uses append so headers are not overridden)
 */
export function combineHeaders(
  ...headers: Array<ResponseInit["headers"] | null | undefined>
) {
  const combined = new Headers();
  for (const header of headers) {
    if (!header) continue;
    for (const [key, value] of new Headers(header).entries()) {
      combined.append(key, value);
    }
  }
  return combined;
}
