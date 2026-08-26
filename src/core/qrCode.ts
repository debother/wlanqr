/**
 * Thin, deterministic wrapper around `qrcode-generator` (MIT, zero runtime
 * dependencies, browser-safe).
 *
 * Two things matter here for scan reliability:
 *
 * 1. UTF-8. The library's default `stringToBytes` truncates each UTF-16 code
 *    unit to one byte, which corrupts umlauts, CJK and emoji. Scanners expect
 *    UTF-8 bytes in byte mode, so we replace it.
 * 2. Plain geometry. One black path on a white rect, four-module quiet zone,
 *    square finder patterns, no logo, no gradient, no rounding.
 */
import qrcode from 'qrcode-generator';

const encoder = new TextEncoder();
qrcode.stringToBytes = (value: string): number[] =>
  Array.from(encoder.encode(value));

/** Quiet zone, in modules. Four is the spec minimum. */
export const QUIET_ZONE = 4;

export interface QrCode {
  /** Module count per side, excluding the quiet zone. */
  readonly count: number;
  /** viewBox side length, including the quiet zone. */
  readonly extent: number;
  /** SVG path data for the dark modules, in module units. */
  readonly path: string;
}

/**
 * Build QR geometry for `text`. Error correction level M: the usual balance,
 * and enough redundancy to survive a printed card with light handling.
 *
 * Throws if the payload is too long to encode.
 */
export function buildQrCode(text: string): QrCode {
  const qr = qrcode(0, 'M');
  qr.addData(text, 'Byte');
  qr.make();

  const count = qr.getModuleCount();
  const segments: string[] = [];

  for (let row = 0; row < count; row += 1) {
    let runStart = -1;
    for (let col = 0; col <= count; col += 1) {
      const dark = col < count && qr.isDark(row, col);
      if (dark && runStart === -1) {
        runStart = col;
      } else if (!dark && runStart !== -1) {
        segments.push(
          `M${runStart + QUIET_ZONE} ${row + QUIET_ZONE}h${col - runStart}v1h-${
            col - runStart
          }z`,
        );
        runStart = -1;
      }
    }
  }

  return { count, extent: count + QUIET_ZONE * 2, path: segments.join('') };
}
