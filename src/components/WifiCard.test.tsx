import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { buildWifiPayload } from '../core/wifiPayload';
import WifiCard, { type WifiCardCopy } from './WifiCard';

const copy: WifiCardCopy = {
  ariaLabel: 'Printable guest Wi-Fi card',
  eyebrow: 'Guest Wi-Fi',
  instruction: 'Scan to connect',
  networkLabel: 'Network',
  passwordLabel: 'Password',
  qrLabel: 'Wi-Fi QR code for the network Card test',
  hiddenNote: 'This network is hidden. Add it manually if needed.',
};

const payload = buildWifiPayload({
  ssid: 'Card test',
  password: ' exact pass ',
  security: 'WPA',
  hidden: false,
});

describe('WifiCard', () => {
  it('hides the plaintext password when the card toggle is off', () => {
    const markup = renderToStaticMarkup(
      <WifiCard
        copy={copy}
        hidden={false}
        payload={payload}
        ssid="Card test"
      />,
    );

    expect(markup).not.toContain(' exact pass ');
    expect(markup).not.toContain('card__password-value');
  });

  it('renders the exact password when the card toggle is on', () => {
    const markup = renderToStaticMarkup(
      <WifiCard
        copy={copy}
        hidden={false}
        payload={payload}
        printedPassword=" exact pass "
        ssid="Card test"
      />,
    );

    expect(markup).toContain('> exact pass </span>');
  });

  it('keeps one card structure for long passwords', () => {
    const longPassword = ` start ${'x'.repeat(180)} end `;
    const markup = renderToStaticMarkup(
      <WifiCard
        copy={copy}
        hidden={false}
        payload={payload}
        printedPassword={longPassword}
        ssid="Card test"
      />,
    );

    expect(markup.match(/<article/g)).toHaveLength(1);
    expect(markup).toContain(longPassword);
    expect(markup).toContain('card__password-value');
  });

  it('uses localized copy in the same printable card', () => {
    const markup = renderToStaticMarkup(
      <WifiCard
        copy={{
          ariaLabel: 'Druckbare Gäste-WLAN-Karte',
          eyebrow: 'Gäste-WLAN',
          instruction: 'Zum Verbinden scannen',
          networkLabel: 'Netzwerk',
          passwordLabel: 'Passwort',
          qrLabel: 'WLAN-QR-Code für das Netzwerk Kartentest',
          hiddenNote: 'Dieses Netzwerk ist verborgen.',
        }}
        hidden={false}
        payload={payload}
        printedPassword="exakt"
        ssid="Kartentest"
      />,
    );

    expect(markup).toContain('Gäste-WLAN');
    expect(markup).toContain('Zum Verbinden scannen');
    expect(markup).toContain('Passwort');
  });
});
