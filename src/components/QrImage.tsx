import { useMemo } from 'react';
import { buildQrCode } from '../core/qrCode';

interface QrImageProps {
  payload: string;
  /** Accessible description. Never contains the password. */
  label: string;
  className?: string;
}

/**
 * Renders the QR symbol as vector SVG: one white background rect plus one
 * black path. Scales to any size without resampling, so the printed symbol is
 * as crisp as the printer allows.
 */
export default function QrImage({ payload, label, className }: QrImageProps) {
  const qr = useMemo(() => buildQrCode(payload), [payload]);

  return (
    <svg
      className={className}
      viewBox={`0 0 ${qr.extent} ${qr.extent}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={qr.extent} height={qr.extent} fill="#ffffff" />
      <path d={qr.path} fill="#000000" />
    </svg>
  );
}
