/**
 * Limite simples de análises por pessoa (por IP), em memória.
 * Protege a cota gratuita da IA contra cliques repetidos. Em hospedagem serverless cada instância
 * tem a própria memória, então é uma proteção "de melhor esforço", suficiente para um projeto de portfólio.
 */

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function createRateLimiter(options: { limit: number; windowMs: number; now?: () => number }) {
  const { limit, windowMs, now = Date.now } = options;
  const hits = new Map<string, number[]>();

  return {
    check(key: string): RateLimitResult {
      const current = now();
      const recent = (hits.get(key) ?? []).filter((time) => current - time < windowMs);

      if (recent.length >= limit) {
        hits.set(key, recent);
        const retryAfterMs = windowMs - (current - recent[0]);
        return { ok: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
      }

      recent.push(current);
      hits.set(key, recent);

      // Faxina ocasional para o mapa não crescer sem fim.
      if (hits.size > 5_000) {
        for (const [otherKey, times] of hits) {
          if (times.every((time) => current - time >= windowMs)) hits.delete(otherKey);
        }
      }

      return { ok: true, remaining: limit - recent.length, retryAfterSeconds: 0 };
    },
  };
}
