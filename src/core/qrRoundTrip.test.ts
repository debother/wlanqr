/**
 * Round-trip evidence: rasterise the SVG geometry we would print, decode it
 * with an independent decoder (jsQR), and compare the recovered *bytes* to the
 * payload bytes.
 *
 * Byte comparison rather than string comparison on purpose — it proves UTF-8
 * survives without depending on how the decoder guesses text encoding.
 *
 * jsQR is a devDependency only. It is not part of the shipped bundle.
 */
import { describe, expect, it } from 'vitest';
import jsQR from 'jsqr';
import { buildQrCode, QUIET_ZONE } from './qrCode';
import { buildWifiPayload, type WifiCredentials } from './wifiPayload';

const SCALE = 6;

/** Re-draw the exact geometry from `buildQrCode` into an RGBA bitmap. */
function rasterise(payload: string) {
  const qr = buildQrCode(payload);
  const side = qr.extent * SCALE;
  const data = new Uint8ClampedArray(side * side * 4).fill(255);

  // Parse the path back out, so the test exercises the emitted path data
  // rather than a second copy of the matrix logic.
  const runs = qr.path.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g);
  for (const [, x, y, width] of runs) {
    const col = Number(x);
    const row = Number(y);
    for (let dy = 0; dy < SCALE; dy += 1) {
      for (let dx = 0; dx < Number(width) * SCALE; dx += 1) {
        const px = col * SCALE + dx;
        const py = row * SCALE + dy;
        const offset = (py * side + px) * 4;
        data[offset] = 0;
        data[offset + 1] = 0;
        data[offset + 2] = 0;
      }
    }
  }
  return { data, side, quiet: QUIET_ZONE };
}

function decodeBytes(payload: string): number[] {
  const { data, side } = rasterise(payload);
  const result = jsQR(data, side, side);
  if (result === null) throw new Error('symbol did not decode');
  const bytes: number[] = [];
  for (const chunk of result.chunks) {
    if ('bytes' in chunk && Array.isArray(chunk.bytes)) bytes.push(...chunk.bytes);
  }
  return bytes;
}

const cases: Array<[string, WifiCredentials]> = [
  ['ASCII WPA', { ssid: 'HomeNet', password: 'hunter2', security: 'WPA', hidden: false }],
  ['open', { ssid: 'CafeFree', security: 'nopass', hidden: false }],
  ['hidden', { ssid: 'Backroom', password: 'hunter2', security: 'WPA', hidden: true }],
  [
    'reserved characters',
    { ssid: 'Home;Net,2:\\', password: 'a;b,c:d\\e"f', security: 'WPA', hidden: false },
  ],
  [
    'umlauts and spaces',
    { ssid: ' Grüße Süd ', password: 'Straße-Öl ', security: 'WPA', hidden: false },
  ],
  [
    'unicode and emoji',
    { ssid: '無線 ☕️', password: 'пароль-🔐-密码', security: 'WPA', hidden: false },
  ],
];

describe('QR round trip (independent decoder)', () => {
  it.each(cases)('%s survives encode → raster → decode', (_name, credentials) => {
    const payload = buildWifiPayload(credentials);
    const expected = Array.from(new TextEncoder().encode(payload));
    expect(decodeBytes(payload)).toEqual(expected);
  });

  it('decodes the reported 4-4-3 numeric password fixture without spaces', () => {
    const payload = buildWifiPayload({
      ssid: 'Numeric fixture network',
      password: '12145634576',
      security: 'WPA',
      hidden: false,
    });
    const decodedPayload = new TextDecoder().decode(
      Uint8Array.from(decodeBytes(payload)),
    );

    expect(decodedPayload).toBe(
      'WIFI:T:WPA;S:Numeric fixture network;P:12145634576;;',
    );
    for (const forbidden of [
      '1214 5634 576',
      '1214 5634 576 ',
      ' 1214 5634 576',
    ]) {
      expect(decodedPayload).not.toContain(forbidden);
    }
  });
});
