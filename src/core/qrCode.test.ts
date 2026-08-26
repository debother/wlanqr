import { describe, expect, it } from 'vitest';
import { buildQrCode, QUIET_ZONE } from './qrCode';

describe('buildQrCode', () => {
  it('is deterministic for the same payload', () => {
    const a = buildQrCode('WIFI:T:WPA;S:HomeNet;P:hunter2;;');
    const b = buildQrCode('WIFI:T:WPA;S:HomeNet;P:hunter2;;');
    expect(a).toEqual(b);
    expect(a.path.length).toBeGreaterThan(0);
  });

  it('reserves a four-module quiet zone in the viewBox', () => {
    const qr = buildQrCode('WIFI:T:nopass;S:Cafe;;');
    expect(QUIET_ZONE).toBe(4);
    expect(qr.extent).toBe(qr.count + 8);
  });

  it('encodes non-ASCII as UTF-8, not truncated UTF-16', () => {
    // 'ü' is two UTF-8 bytes; the library default would emit one. A longer
    // umlaut string therefore needs a larger symbol than its ASCII twin.
    const ascii = buildQrCode('u'.repeat(40));
    const umlaut = buildQrCode('ü'.repeat(40));
    expect(umlaut.count).toBeGreaterThan(ascii.count);
  });

  it('rejects payloads that exceed QR capacity', () => {
    expect(() => buildQrCode('x'.repeat(5000))).toThrow();
  });
});
