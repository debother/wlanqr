import { describe, expect, it } from 'vitest';
import { buildWifiPayload, type WifiCredentials } from './core/wifiPayload';
import {
  detectLanguage,
  getLegalLinks,
  translate,
  type Language,
} from './i18n';

describe('language selection', () => {
  it('uses English as the default and fallback', () => {
    expect(detectLanguage(undefined)).toBe('en');
    expect(translate('en', 'cardEyebrow')).toBe('Guest Wi-Fi');
  });

  it('detects German base and regional browser locales', () => {
    expect(detectLanguage('de')).toBe('de');
    expect(detectLanguage('de-DE')).toBe('de');
    expect(detectLanguage('de-AT')).toBe('de');
  });

  it('maps non-German locales to English', () => {
    expect(detectLanguage('en-GB')).toBe('en');
    expect(detectLanguage('fr-FR')).toBe('en');
  });

  it('provides immediate EN and DE copy for manual switching', () => {
    const selected: Language[] = ['en', 'de', 'en'];
    expect(selected.map((language) => translate(language, 'printButton'))).toEqual(
      ['Print card', 'Karte drucken', 'Print card'],
    );
  });

  it('does not couple credentials or payloads to language switching', () => {
    const credentials: WifiCredentials = {
      ssid: ' Gäste;Netz ',
      password: ' exakt 123 ',
      security: 'WPA',
      hidden: false,
    };
    const before = buildWifiPayload(credentials);

    translate('en', 'cardHeading');
    translate('de', 'cardHeading');

    expect(credentials).toEqual({
      ssid: ' Gäste;Netz ',
      password: ' exakt 123 ',
      security: 'WPA',
      hidden: false,
    });
    expect(buildWifiPayload(credentials)).toBe(before);
  });

  it('uses the matching central Debother legal pages for each language', () => {
    expect(getLegalLinks('en')).toEqual([
      { label: 'Privacy', href: 'https://debother.com/privacy/' },
      { label: 'Imprint', href: 'https://debother.com/imprint/' },
    ]);
    expect(getLegalLinks('de')).toEqual([
      { label: 'Datenschutz', href: 'https://debother.com/datenschutz/' },
      { label: 'Impressum', href: 'https://debother.com/impressum/' },
    ]);
  });
});
