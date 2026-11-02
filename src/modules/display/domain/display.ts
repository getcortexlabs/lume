export const displayCities = ["São Paulo", "Suzano", "Guarulhos"];
export const displayIntervals = [8, 12, 20];
export const DISPLAY_TTL_MS = 60_000;
export function displaySettings(query: Record<string, unknown>) {
  return {
    city: displayCities.includes(String(query.city)) ? String(query.city) : "",
    interval: displayIntervals.includes(Number(query.interval))
      ? Number(query.interval)
      : 12,
    organization: query.organization === "aurora" ? "aurora" : "horizonte",
  };
}
export function leaseValid(expiresAt: number, now: number) {
  return expiresAt > now;
}
