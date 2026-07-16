/** Testbare Zeitquelle (für Cache-TTL / Update-Prüf-Kadenz). */
export interface Clock {
  now(): number;
}

export const systemClock: Clock = {
  now: () => Date.now(),
};
