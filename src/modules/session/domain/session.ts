export type SessionStatus = "active" | "signed-out" | "expired" | "denied";
export const sessionStorageKey = "lume:demo-session:v1";
export const isOrganizationPath = (path: string) =>
  path === "/organization" || path.startsWith("/organization/");

/** Only same-origin organization destinations may follow a simulated sign-in. */
export function sessionReturnPath(input: unknown): string {
  if (
    typeof input !== "string" ||
    !input.startsWith("/") ||
    /[\\\u0000-\u0020]/.test(input)
  )
    return "/organization";
  try {
    const url = new URL(input, "https://lume.invalid");
    if (
      url.origin !== "https://lume.invalid" ||
      !isOrganizationPath(url.pathname)
    )
      return "/organization";
    return url.pathname + url.search + url.hash;
  } catch {
    return "/organization";
  }
}
export function sessionDestination(status: SessionStatus) {
  return status === "expired"
    ? "/session-expired"
    : status === "denied"
      ? "/access-denied"
      : "/sign-in";
}
