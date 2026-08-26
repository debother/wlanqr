import { describe, expect, it } from 'vitest';
import jsQR from 'jsqr';
import { buildWifiPayload } from './wifiPayload';
import { buildQrPngRaster, QR_PNG_FILENAME, QR_PNG_SIZE } from './qrPng';

describe('raw QR PNG raster', () => {
  it('independently decodes to the exact intended QR payload', () => {
    const payload = buildWifiPayload({
      ssid: 'PNG;Test Netz',
      password: ' exakt 123 ',
      security: 'WPA',
      hidden: false,
    });
    const raster = buildQrPngRaster(payload);
    const decoded = jsQR(raster.data, raster.size, raster.size);

    expect(raster.size).toBe(QR_PNG_SIZE);
    expect(decoded?.data).toBe(payload);
  });

  it('is deterministic with a white background and crisp black modules', () => {
    const first = buildQrPngRaster('WIFI:T:nopass;S:Raster test;;', 320);
    const second = buildQrPngRaster('WIFI:T:nopass;S:Raster test;;', 320);
    const colors = new Set<number>();
    let validPixels = true;
    let firstChecksum = 2166136261;
    let secondChecksum = 2166136261;

    for (let index = 0; index < first.data.length; index += 4) {
      colors.add(first.data[index]);
      validPixels &&=
        first.data[index] === first.data[index + 1] &&
        first.data[index] === first.data[index + 2] &&
        first.data[index + 3] === 255;
    }
    for (let index = 0; index < first.data.length; index += 1) {
      firstChecksum = Math.imul(firstChecksum ^ first.data[index], 16777619);
      secondChecksum = Math.imul(secondChecksum ^ second.data[index], 16777619);
    }

    expect(validPixels).toBe(true);
    expect(firstChecksum).toBe(secondChecksum);
    expect(colors).toEqual(new Set([0, 255]));
  });

  it('uses a generic filename with no credential material', () => {
    expect(QR_PNG_FILENAME).toBe('wlanqr.png');
    expect(QR_PNG_FILENAME).not.toContain('PNG;Test Netz');
    expect(QR_PNG_FILENAME).not.toContain('exakt 123');
    expect(QR_PNG_FILENAME).not.toContain('WIFI:');
  });
});
