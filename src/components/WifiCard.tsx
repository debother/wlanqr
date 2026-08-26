import QrImage from './QrImage';

interface WifiCardProps {
  ssid: string;
  payload: string;
  hidden: boolean;
  /** Plaintext password to print. Opt-in only; undefined means "don't print". */
  printedPassword?: string;
  copy: WifiCardCopy;
}

export interface WifiCardCopy {
  readonly ariaLabel: string;
  readonly eyebrow: string;
  readonly instruction: string;
  readonly networkLabel: string;
  readonly passwordLabel: string;
  readonly qrLabel: string;
  readonly hiddenNote: string;
}

/**
 * The card. Pure presentation: it receives a finished payload and never
 * touches payload construction or validation.
 *
 * Text and rules are DOM, the symbol is vector SVG — nothing is rasterised.
 */
export default function WifiCard({
  ssid,
  payload,
  hidden,
  printedPassword,
  copy,
}: WifiCardProps) {
  return (
    <article className="card" aria-label={copy.ariaLabel}>
      <p className="card__eyebrow">{copy.eyebrow}</p>
      <QrImage
        className="card__qr"
        payload={payload}
        label={copy.qrLabel}
      />

      <p className="card__instruction">{copy.instruction}</p>

      <div className="card__details">
        <p className="card__ssid-label">{copy.networkLabel}</p>
        <p className="card__ssid">{ssid}</p>

        {printedPassword !== undefined && (
          <p className="card__password">
            <span className="card__password-label">{copy.passwordLabel}</span>
            <span className="card__password-value">{printedPassword}</span>
          </p>
        )}
      </div>

      {hidden && (
        <p className="card__note">{copy.hiddenNote}</p>
      )}

      <p className="card__colophon">wlanqr · debother.com</p>
    </article>
  );
}
