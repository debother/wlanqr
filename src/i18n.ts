export type Language = 'en' | 'de';

const en = {
  documentTitle: 'WLANQR — guest Wi-Fi card',
  documentDescription:
    'Turn Wi-Fi credentials into a printable QR card. Credentials stay in this browser tab.',
  languageGroupLabel: 'Language',
  mastheadTitle: 'Enter your Wi-Fi once. Print a card. Guests scan and connect.',
  networkDetailsHeading: 'Network details',
  ssidLabel: 'Network name (SSID)',
  ssidHint:
    'Type it exactly as it appears on your phone, including spaces and capitals.',
  securityLegend: 'Security',
  securityWpaLabel: 'WPA2 or WPA3 (password)',
  securityWpaHint: 'The normal choice for home and guest networks.',
  securityOpenLabel: 'Open (no password)',
  securityOpenHint: 'Anyone in range can join.',
  securityWepLabel: 'WEP (legacy)',
  securityWepHint: 'Only for very old equipment. WEP is not secure.',
  passwordLabel: 'Password',
  showPasswordInput: 'Show',
  hidePasswordInput: 'Hide',
  passwordHint: 'Kept exactly as typed — leading and trailing spaces included.',
  pasteWhitespaceNotice:
    'Pasted text contains spaces. WLANQR kept it exactly as pasted—check that the spaces are part of the real password.',
  hiddenLabel: 'This network is hidden',
  hiddenHint:
    'Helps compatible phones connect when the network does not broadcast its name.',
  showPasswordOnCardLabel: 'Show password on card',
  showPasswordOnCardHint:
    'Off by default. Use only if the card stays somewhere you trust.',
  cardHeading: 'Your card',
  notReadyLabel: 'Not ready yet',
  validationSsidRequired: 'Enter the network name before creating a code.',
  validationSsidTooLong: 'Network names are limited to 32 bytes.',
  validationPasswordRequired: 'This security type needs a password.',
  validationQrTooLong:
    'That network name and password are too long for one QR code.',
  printButton: 'Print card',
  downloadQrButton: 'Download QR',
  actionsHint:
    'Print opens your browser’s print dialog, where you can also choose “Save as PDF”.',
  statusReadyTag: 'Code built',
  statusReadyBody:
    'Built from exactly what you typed. WLANQR cannot verify the network or password, so scan the card before sharing it.',
  privacyLead:
    'Your Wi-Fi credentials are processed locally in this browser tab.',
  privacyDetail:
    'The page itself must load normally, but credentials are not uploaded, analyzed, or stored. No account, analytics, cookies, or saved history.',
  legalNavigationLabel: 'Legal',
  privacyLinkLabel: 'Privacy',
  imprintLinkLabel: 'Imprint',
  madeByDebother: 'Made by debother.',
  githubLink: 'GitHub',
  cardAriaLabel: 'Printable guest Wi-Fi card',
  cardEyebrow: 'Guest Wi-Fi',
  cardInstruction: 'Scan to connect',
  cardNetworkLabel: 'Network',
  cardPasswordLabel: 'Password',
  cardHiddenNote:
    'This network is hidden. If your phone cannot find it, add it manually using the name above.',
  qrAriaLabel: 'Wi-Fi QR code for the network {ssid}',
} as const;

export type TranslationKey = keyof typeof en;
type Translation = Record<TranslationKey, string>;

const de: Translation = {
  documentTitle: 'WLANQR — Gäste-WLAN-Karte',
  documentDescription:
    'WLAN-Zugangsdaten als druckbare QR-Karte. Die Zugangsdaten bleiben in diesem Browser-Tab.',
  languageGroupLabel: 'Sprache',
  mastheadTitle:
    'WLAN-Daten eingeben. Karte drucken. Gäste scannen und verbinden.',
  networkDetailsHeading: 'Netzwerkdaten',
  ssidLabel: 'Netzwerkname (SSID)',
  ssidHint:
    'Genau so eingeben, wie der Name auf dem Gerät erscheint – einschließlich Leerzeichen und Groß- und Kleinschreibung.',
  securityLegend: 'Sicherheit',
  securityWpaLabel: 'WPA2 oder WPA3 (mit Passwort)',
  securityWpaHint: 'Die übliche Wahl für private und Gäste-Netzwerke.',
  securityOpenLabel: 'Offen (ohne Passwort)',
  securityOpenHint: 'Alle in Reichweite können sich verbinden.',
  securityWepLabel: 'WEP (veraltet)',
  securityWepHint: 'Nur für sehr alte Geräte. WEP ist unsicher.',
  passwordLabel: 'Passwort',
  showPasswordInput: 'Anzeigen',
  hidePasswordInput: 'Ausblenden',
  passwordHint:
    'Wird exakt wie eingegeben übernommen – auch Leerzeichen am Anfang oder Ende.',
  pasteWhitespaceNotice:
    'Der eingefügte Text enthält Leerzeichen. WLANQR hat ihn unverändert übernommen. Prüfe, ob die Leerzeichen wirklich zum Passwort gehören.',
  hiddenLabel: 'Dieses Netzwerk ist verborgen',
  hiddenHint:
    'Hilft kompatiblen Geräten, wenn das Netzwerk seinen Namen nicht sichtbar sendet.',
  showPasswordOnCardLabel: 'Passwort auf Karte anzeigen',
  showPasswordOnCardHint:
    'Standardmäßig aus. Nur verwenden, wenn die Karte an einem vertrauenswürdigen Ort liegt.',
  cardHeading: 'Deine Karte',
  notReadyLabel: 'Noch nicht bereit',
  validationSsidRequired:
    'Gib zuerst den Netzwerknamen ein, um einen Code zu erstellen.',
  validationSsidTooLong: 'Netzwerknamen sind auf 32 Byte begrenzt.',
  validationPasswordRequired: 'Diese Sicherheitsart benötigt ein Passwort.',
  validationQrTooLong:
    'Netzwerkname und Passwort sind für einen einzelnen QR-Code zu lang.',
  printButton: 'Karte drucken',
  downloadQrButton: 'QR herunterladen',
  actionsHint:
    'Drucken öffnet den Browser-Dialog. Dort ist auch „Als PDF speichern“ möglich.',
  statusReadyTag: 'Code erstellt',
  statusReadyBody:
    'Erstellt aus deinen exakten Eingaben. WLANQR kann Netzwerk und Passwort nicht prüfen – teste die Karte vor dem Weitergeben.',
  privacyLead:
    'Deine WLAN-Zugangsdaten werden lokal in diesem Browser-Tab verarbeitet.',
  privacyDetail:
    'Die Seite selbst wird normal geladen, Zugangsdaten werden aber weder hochgeladen noch analysiert oder gespeichert. Kein Konto, keine Analyse, keine Cookies, kein Verlauf.',
  legalNavigationLabel: 'Rechtliches',
  privacyLinkLabel: 'Datenschutz',
  imprintLinkLabel: 'Impressum',
  madeByDebother: 'Made by debother.',
  githubLink: 'GitHub',
  cardAriaLabel: 'Druckbare Gäste-WLAN-Karte',
  cardEyebrow: 'Gäste-WLAN',
  cardInstruction: 'Zum Verbinden scannen',
  cardNetworkLabel: 'Netzwerk',
  cardPasswordLabel: 'Passwort',
  cardHiddenNote:
    'Dieses Netzwerk ist verborgen. Falls dein Gerät es nicht findet, füge es mit dem Namen oben manuell hinzu.',
  qrAriaLabel: 'WLAN-QR-Code für das Netzwerk {ssid}',
};

const translations: Record<Language, Translation> = { en, de };

export function detectLanguage(browserLanguage: string | undefined): Language {
  return browserLanguage?.toLowerCase().split('-')[0] === 'de' ? 'de' : 'en';
}

export function translate(language: Language, key: TranslationKey): string {
  return translations[language]?.[key] || en[key];
}

export function formatTranslation(
  language: Language,
  key: TranslationKey,
  values: Readonly<Record<string, string>>,
): string {
  let result = translate(language, key);
  for (const [name, value] of Object.entries(values)) {
    result = result.split(`{${name}}`).join(value);
  }
  return result;
}

export function getLegalLinks(language: Language) {
  if (language === 'de') {
    return [
      {
        label: translate(language, 'privacyLinkLabel'),
        href: 'https://debother.com/datenschutz/',
      },
      {
        label: translate(language, 'imprintLinkLabel'),
        href: 'https://debother.com/impressum/',
      },
    ] as const;
  }

  return [
    {
      label: translate(language, 'privacyLinkLabel'),
      href: 'https://debother.com/privacy/',
    },
    {
      label: translate(language, 'imprintLinkLabel'),
      href: 'https://debother.com/imprint/',
    },
  ] as const;
}
