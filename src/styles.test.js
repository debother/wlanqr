import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');

describe('print stylesheet', () => {
  it('removes screen UI from print layout without hiding it in place', () => {
    const start = styles.search(/@media\s+print\s*{/);
    const end = styles.search(/@media\s*\(prefers-reduced-motion:/);
    const printRules = styles.slice(start, end);

    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    expect(printRules).not.toMatch(/body\s+\*\s*{[^}]*visibility:\s*hidden/);
    expect(printRules).toContain('.panel--output > :not(.sheet)');
    expect(printRules).toContain('display: none');
    expect(printRules).toContain('width: 120mm');
    expect(printRules).toContain('min-height: 170mm');
    expect(printRules).toContain('break-inside: avoid');
  });

  it('preserves intentional password spacing and contains long values', () => {
    expect(styles).toMatch(
      /\.card__password-value\s*{[^}]*overflow-wrap:\s*anywhere/,
    );
    expect(styles).toMatch(
      /\.card__password-value\s*{[^}]*white-space:\s*pre-wrap/,
    );
  });

  it('prevents the QR from shrinking out of square in the card flex layout', () => {
    expect(styles).toMatch(/\.card__qr\s*{[^}]*flex:\s*none/);
    expect(styles).toMatch(/\.card__qr\s*{[^}]*aspect-ratio:\s*1/);
  });
});
