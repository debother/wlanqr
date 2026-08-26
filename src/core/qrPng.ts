import { buildQrCode } from './qrCode';

export const QR_PNG_FILENAME = 'wlanqr.png';
export const QR_PNG_SIZE = 1024;

export interface QrPngRaster {
  readonly data: Uint8ClampedArray;
  readonly size: number;
}

/**
 * Rasterise the exact SVG path geometry onto a square white RGBA canvas.
 * Integer module scaling keeps every edge crisp and preserves the quiet zone.
 */
export function buildQrPngRaster(
  payload: string,
  size = QR_PNG_SIZE,
): QrPngRaster {
  const qr = buildQrCode(payload);
  const moduleSize = Math.floor(size / qr.extent);
  if (moduleSize < 1) throw new Error('PNG size is too small for this QR code.');

  const renderedSize = qr.extent * moduleSize;
  const offset = Math.floor((size - renderedSize) / 2);
  const data = new Uint8ClampedArray(size * size * 4).fill(255);

  const runs = qr.path.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g);
  for (const [, x, y, width] of runs) {
    const startX = offset + Number(x) * moduleSize;
    const startY = offset + Number(y) * moduleSize;
    const runWidth = Number(width) * moduleSize;

    for (let dy = 0; dy < moduleSize; dy += 1) {
      for (let dx = 0; dx < runWidth; dx += 1) {
        const pixel = ((startY + dy) * size + startX + dx) * 4;
        data[pixel] = 0;
        data[pixel + 1] = 0;
        data[pixel + 2] = 0;
      }
    }
  }

  return { data, size };
}
