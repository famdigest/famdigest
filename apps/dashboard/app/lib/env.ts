import { isBrowser } from "./isBrowser";

type EnvOptions = {
  isSecret?: boolean;
  isRequired?: boolean;
};
function getEnv(
  name: string,
  { isRequired, isSecret }: EnvOptions = { isSecret: true, isRequired: true }
): string {
  if (isBrowser && isSecret) return "";

  const source = (isBrowser ? window.env : process.env) ?? {};

  const value = source[name as keyof typeof source] as string;

  if (!value && isRequired) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

export const SENTRY_DSN = getEnv("SENTRY_DSN", { isSecret: false });
