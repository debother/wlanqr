import { describe, expect, it } from 'vitest';
import { buildWifiPayload } from './core/wifiPayload';
import { translate } from './i18n';
import {
  INITIAL_PASSWORD_PASTE_NOTICE,
  noticeAfterPasswordChange,
  noticeAfterPasswordPaste,
} from './passwordPasteNotice';

describe('password paste notice', () => {
  it('detects spaces in pasted text without retaining the credential', () => {
    const pasted = '1214 5634 576';
    const state = noticeAfterPasswordPaste(pasted);

    expect(state.visible).toBe(true);
    expect(Object.values(state)).not.toContain(pasted);
  });

  it('does not show for pasted text without whitespace', () => {
    expect(noticeAfterPasswordPaste('password').visible).toBe(false);
  });

  it('does not show merely because manually typed text contains a space', () => {
    const manuallyTyped = 'hello world';
    const state = noticeAfterPasswordChange(INITIAL_PASSWORD_PASTE_NOTICE);

    expect(manuallyTyped).toContain(' ');
    expect(state.visible).toBe(false);
  });

  it('uses fixed copy that never contains the credential value', () => {
    for (const language of ['en', 'de'] as const) {
      const copy = translate(language, 'pasteWhitespaceNotice');
      expect(copy).not.toContain('1214 5634 576');
      expect(copy.length).toBeGreaterThan(0);
    }
    expect(translate('en', 'pasteWhitespaceNotice')).toContain(
      'kept it exactly as pasted',
    );
  });

  it('preserves pasted whitespace byte-for-byte in the QR payload', () => {
    const password = '1214 5634 576';

    expect(
      buildWifiPayload({
        ssid: 'Paste notice test network',
        password,
        security: 'WPA',
        hidden: false,
      }),
    ).toBe('WIFI:T:WPA;S:Paste notice test network;P:1214 5634 576;;');
  });

  it('keeps the notice through paste input, then clears or updates it', () => {
    let state = noticeAfterPasswordPaste('1214 5634 576');
    state = noticeAfterPasswordChange(state);
    expect(state.visible).toBe(true);

    state = noticeAfterPasswordChange(state);
    expect(state.visible).toBe(false);

    state = noticeAfterPasswordPaste('another password');
    state = noticeAfterPasswordChange(state);
    expect(state.visible).toBe(true);

    state = noticeAfterPasswordPaste('replacement');
    state = noticeAfterPasswordChange(state);
    expect(state.visible).toBe(false);
  });
});
