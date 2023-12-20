export async function handleErrorsJson<Type>(
  response: Response
): Promise<Type> {
  if (response.headers.get("content-encoding") === "gzip") {
    const responseText = await response.text();
    return new Promise((resolve) => resolve(JSON.parse(responseText)));
  }

  if (response.status === 204) {
    return new Promise((resolve) => resolve({} as Type));
  }

  if (!response.ok && (response.status < 200 || response.status >= 300)) {
    response.json().then(console.log);
    throw Error(response.statusText);
  }

  return response.json();
}
