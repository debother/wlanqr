# WLANQR

Create a Wi-Fi QR card in seconds.

WLANQR is a small English/German browser utility for creating a printable guest
Wi-Fi card and downloading its QR code as a PNG.

## Core properties

- Credentials are processed locally in the browser.
- No account, credential uploads, analytics, or browser storage.
- English and German interface.
- One printable guest Wi-Fi card.
- Optional plaintext password display, off by default.
- Raw 1024 × 1024 QR PNG download.
- Pasted whitespace is preserved exactly; the UI warns when pasted passwords
  contain whitespace so users can verify the source value.

WLANQR does not trim or normalize the SSID or password. It produces the common
`WIFI:` QR payload for WPA/WPA3-Personal, open, and legacy WEP networks. It does
not support enterprise Wi-Fi or captive-portal authentication.

## Local development

Requirements: a current Node.js release and npm.

```bash
npm ci
npm run dev
```

Validation and production build:

```bash
npm test
npx tsc -b
npm run lint
npm run build
npm audit
```

The production build is written to `dist/`.

## Validation status

The feature-frozen V1 software baseline passes 63 automated tests, strict
TypeScript checking, lint, production build, dependency audit, bundle privacy
checks, and independent QR encode/decode tests. Browser rendering has been
reviewed in English and German at 320, 375, 768, and 1280 px.

Physical acceptance is still pending: scanning with real iPhone and Android
devices, browser print-preview review, printing a physical card, and first-time
human completion testing. A generated QR code confirms payload construction, not
that the entered credentials are correct or that a particular device will join.

---

A Debother utility — small software for annoying problems.
