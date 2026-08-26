import {
  buildQrPngRaster,
  QR_PNG_FILENAME,
  type QrPngRaster,
} from './core/qrPng';

function rasterToPngDataUrl(raster: QrPngRaster): string {
  const canvas = document.createElement('canvas');
  canvas.width = raster.size;
  canvas.height = raster.size;
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('Canvas is unavailable.');

  const image = context.createImageData(raster.size, raster.size);
  image.data.set(raster.data);
  context.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

export function downloadQrPng(payload: string): void {
  const link = document.createElement('a');
  link.download = QR_PNG_FILENAME;
  link.href = rasterToPngDataUrl(buildQrPngRaster(payload));
  document.body.append(link);
  link.click();
  link.remove();
}
