import { describe, expect, it } from 'vitest';

import { createRateLimiter } from '@/lib/rate-limit';

describe('limite de análises por pessoa', () => {
  it('bloqueia depois do limite e libera quando a janela passa', () => {
    let now = 0;
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000, now: () => now });

    expect(limiter.check('ip-1').ok).toBe(true);
    expect(limiter.check('ip-1').ok).toBe(true);

    const blocked = limiter.check('ip-1');
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(60);

    expect(limiter.check('ip-2').ok).toBe(true); // cada pessoa tem o próprio limite

    now = 60_001;
    expect(limiter.check('ip-1').ok).toBe(true);
  });
});
