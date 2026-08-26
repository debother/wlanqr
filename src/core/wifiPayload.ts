/**
 * Wi-Fi QR payload construction.
 *
 * Format (the de-facto "ZXing" Wi-Fi schema that iOS Camera, Android and
 * mainstream scanner apps implement):
 *
 *   WIFI:T:<security>;S:<ssid>;P:<password>;H:<hidden>;;
 *
 * Escaping rules implemented in `escapeWifiField`:
 *   \  ;  ,  :  "   are each prefixed with a single backslash.
 *
 * Deliberately NOT implemented (see README "Schema limitations"):
 *   - the optional "wrap all-hex values in double quotes" convention.
 *
 * This module is pure: no DOM, no I/O, no logging, no mutation of its input.
 */

export type WifiSecurity = 'WPA' | 'WEP' | 'nopass';

export interface WifiCredentials {
  readonly ssid: string;
  readonly password?: string;
  readonly security: WifiSecurity;
  readonly hidden: boolean;
}

export type WifiValidationCode =
  | 'SSID_REQUIRED'
  | 'PASSWORD_REQUIRED'
  | 'SSID_TOO_LONG';

export class WifiPayloadError extends Error {
  readonly code: WifiValidationCode;
  constructor(code: WifiValidationCode, message: string) {
    super(message);
    this.name = 'WifiPayloadError';
    this.code = code;
  }
}

/** Characters that terminate or delimit a field and therefore must be escaped. */
const RESERVED = /[\\;,:"]/g;

/**
 * Escape one field value. Never trims, never normalises, never re-orders.
 * Deterministic: same input -> same output.
 */
export function escapeWifiField(value: string): string {
  return value.replace(RESERVED, (char) => '\\' + char);
}

/**
 * Validate credentials without building a payload.
 * Returns an empty array when the credentials are usable.
 *
 * NOTE: this checks *form*, not truth. It cannot tell whether the network
 * exists or whether the password is correct.
 */
export function validateCredentials(
  credentials: WifiCredentials,
): WifiValidationCode[] {
  const issues: WifiValidationCode[] = [];

  if (credentials.ssid.length === 0) {
    issues.push('SSID_REQUIRED');
  }
  // 32 bytes is the 802.11 SSID limit. This is a spec limit, not a
  // router-specific rule.
  if (new TextEncoder().encode(credentials.ssid).length > 32) {
    issues.push('SSID_TOO_LONG');
  }
  if (credentials.security !== 'nopass') {
    if (credentials.password === undefined || credentials.password.length === 0) {
      issues.push('PASSWORD_REQUIRED');
    }
  }

  return issues;
}

const MESSAGES: Record<WifiValidationCode, string> = {
  SSID_REQUIRED: 'Enter the network name before creating a code.',
  SSID_TOO_LONG: 'Network names are limited to 32 bytes.',
  PASSWORD_REQUIRED: 'This security type needs a password.',
};

export function messageFor(code: WifiValidationCode): string {
  return MESSAGES[code];
}

/**
 * Build the Wi-Fi QR payload string.
 *
 * Throws `WifiPayloadError` for invalid input. The thrown message never
 * contains credential material.
 */
export function buildWifiPayload(credentials: WifiCredentials): string {
  const issues = validateCredentials(credentials);
  if (issues.length > 0) {
    throw new WifiPayloadError(issues[0], MESSAGES[issues[0]]);
  }

  const parts: string[] = [
    `T:${credentials.security}`,
    `S:${escapeWifiField(credentials.ssid)}`,
  ];

  // Open networks emit no P field at all.
  if (credentials.security !== 'nopass') {
    parts.push(`P:${escapeWifiField(credentials.password as string)}`);
  }

  // H is only emitted when true. Emitting H:false is legal but some older
  // parsers mishandle it, and omission is the documented default.
  if (credentials.hidden) {
    parts.push('H:true');
  }

  return `WIFI:${parts.map((part) => part + ';').join('')};`;
}
