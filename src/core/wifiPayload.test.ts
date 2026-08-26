import { describe, expect, it } from 'vitest';
import {
  buildWifiPayload,
  escapeWifiField,
  validateCredentials,
  WifiPayloadError,
  type WifiCredentials,
} from './wifiPayload';

const wpa = (
  ssid: string,
  password: string,
  hidden = false,
): WifiCredentials => ({ ssid, password, security: 'WPA', hidden });

/**
 * Split a payload body into fields on *unescaped* semicolons.
 * Used to prove that escaped credential content never breaks the record.
 */
function splitFields(payload: string): string[] {
  const body = payload.slice('WIFI:'.length, -1); // drop prefix and final ';'
  const fields: string[] = [];
  let current = '';
  for (let i = 0; i < body.length; i += 1) {
    const char = body[i];
    if (char === '\\') {
      current += char + body[i + 1];
      i += 1;
    } else if (char === ';') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current.length > 0) fields.push(current);
  return fields;
}

function unescape(value: string): string {
  return value.replace(/\\(.)/g, '$1');
}

function fieldValue(payload: string, key: string): string | undefined {
  const field = splitFields(payload).find((f) => f.startsWith(key + ':'));
  return field === undefined ? undefined : unescape(field.slice(key.length + 1));
}

describe('buildWifiPayload — golden fixtures', () => {
  it('1. WPA basic ASCII SSID/password', () => {
    expect(buildWifiPayload(wpa('HomeNet', 'hunter2'))).toBe(
      'WIFI:T:WPA;S:HomeNet;P:hunter2;;',
    );
  });

  it('2. open network', () => {
    expect(
      buildWifiPayload({ ssid: 'CafeFree', security: 'nopass', hidden: false }),
    ).toBe('WIFI:T:nopass;S:CafeFree;;');
  });

  it('3. hidden network', () => {
    expect(buildWifiPayload(wpa('HomeNet', 'hunter2', true))).toBe(
      'WIFI:T:WPA;S:HomeNet;P:hunter2;H:true;;',
    );
  });

  it('4. SSID containing semicolon', () => {
    const payload = buildWifiPayload(wpa('Home;Net', 'hunter2'));
    expect(payload).toBe('WIFI:T:WPA;S:Home\\;Net;P:hunter2;;');
    expect(fieldValue(payload, 'S')).toBe('Home;Net');
  });

  it('5. password containing semicolon', () => {
    const payload = buildWifiPayload(wpa('HomeNet', 'a;b'));
    expect(payload).toBe('WIFI:T:WPA;S:HomeNet;P:a\\;b;;');
    expect(fieldValue(payload, 'P')).toBe('a;b');
  });

  it('6. SSID containing colon', () => {
    const payload = buildWifiPayload(wpa('Home:Net', 'hunter2'));
    expect(payload).toBe('WIFI:T:WPA;S:Home\\:Net;P:hunter2;;');
    expect(fieldValue(payload, 'S')).toBe('Home:Net');
  });

  it('7. password containing colon', () => {
    const payload = buildWifiPayload(wpa('HomeNet', 'a:b'));
    expect(fieldValue(payload, 'P')).toBe('a:b');
  });

  it('8. SSID containing comma', () => {
    const payload = buildWifiPayload(wpa('Home,Net', 'hunter2'));
    expect(payload).toBe('WIFI:T:WPA;S:Home\\,Net;P:hunter2;;');
    expect(fieldValue(payload, 'S')).toBe('Home,Net');
  });

  it('9. password containing comma', () => {
    expect(fieldValue(buildWifiPayload(wpa('HomeNet', 'a,b')), 'P')).toBe('a,b');
  });

  it('10. backslash in SSID', () => {
    const payload = buildWifiPayload(wpa('Home\\Net', 'hunter2'));
    expect(payload).toBe('WIFI:T:WPA;S:Home\\\\Net;P:hunter2;;');
    expect(fieldValue(payload, 'S')).toBe('Home\\Net');
  });

  it('11. backslash in password', () => {
    const payload = buildWifiPayload(wpa('HomeNet', 'a\\;b'));
    expect(payload).toBe('WIFI:T:WPA;S:HomeNet;P:a\\\\\\;b;;');
    expect(fieldValue(payload, 'P')).toBe('a\\;b');
  });

  it('12. spaces inside SSID', () => {
    expect(buildWifiPayload(wpa('Guest Wi Fi', 'hunter2'))).toBe(
      'WIFI:T:WPA;S:Guest Wi Fi;P:hunter2;;',
    );
  });

  it('13. leading space in SSID preserved', () => {
    const payload = buildWifiPayload(wpa('  Lobby', 'hunter2'));
    expect(payload).toBe('WIFI:T:WPA;S:  Lobby;P:hunter2;;');
    expect(fieldValue(payload, 'S')).toBe('  Lobby');
  });

  it('14. trailing space in password preserved', () => {
    const payload = buildWifiPayload(wpa('HomeNet', 'hunter2  '));
    expect(fieldValue(payload, 'P')).toBe('hunter2  ');
  });

  it('keeps the reported 4-4-3 numeric password fixture ungrouped', () => {
    const password = '12145634576';
    const payload = buildWifiPayload(wpa('Numeric fixture network', password));

    expect(fieldValue(payload, 'P')).toBe(password);
    expect(payload).toBe(
      'WIFI:T:WPA;S:Numeric fixture network;P:12145634576;;',
    );
    for (const forbidden of [
      '1214 5634 576',
      '1214 5634 576 ',
      ' 1214 5634 576',
    ]) {
      expect(payload).not.toContain(forbidden);
    }
  });

  it('15. umlauts', () => {
    const payload = buildWifiPayload(wpa('Grüße-Süd', 'Straße-Öl-Über'));
    expect(payload).toBe('WIFI:T:WPA;S:Grüße-Süd;P:Straße-Öl-Über;;');
  });

  it('16. Unicode non-Latin characters', () => {
    const payload = buildWifiPayload(wpa('無線ネット', 'пароль-密码'));
    expect(fieldValue(payload, 'S')).toBe('無線ネット');
    expect(fieldValue(payload, 'P')).toBe('пароль-密码');
  });

  it('17. emoji', () => {
    const payload = buildWifiPayload(wpa('Caf\u00e9 \u2615\ufe0f', 'p\u{1f510}ss'));
    expect(fieldValue(payload, 'S')).toBe('Caf\u00e9 \u2615\ufe0f');
    expect(fieldValue(payload, 'P')).toBe('p\u{1f510}ss');
  });

  it('18. empty SSID rejected', () => {
    expect(() => buildWifiPayload(wpa('', 'hunter2'))).toThrowError(
      WifiPayloadError,
    );
    expect(validateCredentials(wpa('', 'hunter2'))).toContain('SSID_REQUIRED');
  });

  it('19. WPA without password rejected', () => {
    expect(() =>
      buildWifiPayload({ ssid: 'HomeNet', security: 'WPA', hidden: false }),
    ).toThrowError(WifiPayloadError);
    expect(() => buildWifiPayload(wpa('HomeNet', ''))).toThrowError(
      WifiPayloadError,
    );
    expect(() =>
      buildWifiPayload({ ssid: 'Old', security: 'WEP', hidden: false }),
    ).toThrowError(WifiPayloadError);
  });

  it('20. open network does not emit password field', () => {
    const payload = buildWifiPayload({
      ssid: 'CafeFree',
      password: 'ignored-by-design',
      security: 'nopass',
      hidden: false,
    });
    expect(payload).not.toContain('P:');
    expect(payload).not.toContain('ignored-by-design');
    expect(fieldValue(payload, 'P')).toBeUndefined();
  });

  it('21. deterministic output', () => {
    const credentials = wpa('Grüße;Süd\\', 'a,b:c;d ');
    const runs = new Set(
      Array.from({ length: 50 }, () => buildWifiPayload(credentials)),
    );
    expect(runs.size).toBe(1);
  });

  it('22. source credential object not mutated', () => {
    const credentials = wpa(' Home;Net ', ' a\\b: ', true);
    const snapshot = JSON.stringify(credentials);
    buildWifiPayload(credentials);
    expect(JSON.stringify(credentials)).toBe(snapshot);
  });

  it('23. escaped payload contains no accidental field break', () => {
    const hostile = 'x;S:Evil;P:pwn;T:nopass;;';
    const payload = buildWifiPayload(wpa(hostile, hostile));
    const fields = splitFields(payload);
    expect(fields).toHaveLength(3);
    expect(fields[0]).toBe('T:WPA');
    expect(fieldValue(payload, 'S')).toBe(hostile);
    expect(fieldValue(payload, 'P')).toBe(hostile);
  });

  it('24. hidden false omits the H field', () => {
    const payload = buildWifiPayload(wpa('HomeNet', 'hunter2', false));
    expect(payload).not.toContain('H:');
  });

  it('25. hidden true emits H:true', () => {
    expect(buildWifiPayload(wpa('HomeNet', 'hunter2', true))).toContain(
      ';H:true;',
    );
    expect(
      buildWifiPayload({ ssid: 'Quiet', security: 'nopass', hidden: true }),
    ).toBe('WIFI:T:nopass;S:Quiet;H:true;;');
  });
});

describe('escapeWifiField', () => {
  it('escapes exactly the reserved set and nothing else', () => {
    expect(escapeWifiField('\\;,:"')).toBe('\\\\\\;\\,\\:\\"');
    expect(escapeWifiField("a'b#c&d=e f")).toBe("a'b#c&d=e f");
  });

  it('is idempotent only under explicit re-escaping (documented)', () => {
    expect(escapeWifiField(escapeWifiField(';'))).toBe('\\\\\\;');
  });
});

describe('documented schema limitations', () => {
  it('keeps a 64-character hex-looking WPA password literal and unquoted', () => {
    const password = 'a'.repeat(64);

    expect(buildWifiPayload(wpa('Hex-shaped test network', password))).toBe(
      `WIFI:T:WPA;S:Hex-shaped test network;P:${password};;`,
    );
  });
});

describe('validateCredentials', () => {
  it('accepts a 32-byte SSID and rejects 33 bytes', () => {
    expect(validateCredentials(wpa('a'.repeat(32), 'pw'))).toEqual([]);
    expect(validateCredentials(wpa('a'.repeat(33), 'pw'))).toContain(
      'SSID_TOO_LONG',
    );
    // 11 umlauts = 22 bytes, fine; 17 = 34 bytes, too long.
    expect(validateCredentials(wpa('ü'.repeat(11), 'pw'))).toEqual([]);
    expect(validateCredentials(wpa('ü'.repeat(17), 'pw'))).toContain(
      'SSID_TOO_LONG',
    );
  });

  it('ignores the password for open networks', () => {
    expect(
      validateCredentials({ ssid: 'Cafe', security: 'nopass', hidden: false }),
    ).toEqual([]);
  });
});
