import { useEffect, useId, useMemo, useState } from 'react';
import WifiCard from './components/WifiCard';
import { buildQrCode } from './core/qrCode';
import {
  buildWifiPayload,
  validateCredentials,
  type WifiCredentials,
  type WifiSecurity,
  type WifiValidationCode,
} from './core/wifiPayload';
import { downloadQrPng } from './downloadQrPng';
import {
  detectLanguage,
  formatTranslation,
  translate,
  type Language,
  type TranslationKey,
} from './i18n';
import {
  INITIAL_PASSWORD_PASTE_NOTICE,
  noticeAfterPasswordChange,
  noticeAfterPasswordPaste,
} from './passwordPasteNotice';

const SECURITY_OPTIONS: ReadonlyArray<{
  id: string;
  labelKey: TranslationKey;
  hintKey: TranslationKey;
  token: WifiSecurity;
}> = [
  {
    id: 'wpa',
    labelKey: 'securityWpaLabel',
    hintKey: 'securityWpaHint',
    token: 'WPA',
  },
  {
    id: 'open',
    labelKey: 'securityOpenLabel',
    hintKey: 'securityOpenHint',
    token: 'nopass',
  },
  {
    id: 'wep',
    labelKey: 'securityWepLabel',
    hintKey: 'securityWepHint',
    token: 'WEP',
  },
];

const VALIDATION_KEYS: Record<WifiValidationCode, TranslationKey> = {
  SSID_REQUIRED: 'validationSsidRequired',
  SSID_TOO_LONG: 'validationSsidTooLong',
  PASSWORD_REQUIRED: 'validationPasswordRequired',
};

export default function App() {
  const [language, setLanguage] = useState<Language>(() =>
    detectLanguage(navigator.language),
  );
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [optionId, setOptionId] = useState('wpa');
  const [hidden, setHidden] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showPasswordOnCard, setShowPasswordOnCard] = useState(false);
  const [passwordPasteNotice, setPasswordPasteNotice] = useState(
    INITIAL_PASSWORD_PASTE_NOTICE,
  );

  const ids = {
    ssid: useId(),
    password: useId(),
    security: useId(),
    hint: useId(),
    passwordPaste: useId(),
    status: useId(),
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translate(language, 'documentTitle');
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', translate(language, 'documentDescription'));
  }, [language]);

  const t = (key: TranslationKey) => translate(language, key);
  const option =
    SECURITY_OPTIONS.find((entry) => entry.id === optionId) ??
    SECURITY_OPTIONS[0];
  const needsPassword = option.token !== 'nopass';
  const passwordDescription = [
    ids.hint,
    passwordPasteNotice.visible ? ids.passwordPaste : null,
  ]
    .filter((id): id is string => id !== null)
    .join(' ');

  const credentials: WifiCredentials = useMemo(
    () => ({
      ssid,
      password: needsPassword ? password : undefined,
      security: option.token,
      hidden,
    }),
    [ssid, password, needsPassword, option.token, hidden],
  );

  const result = useMemo((): { payload: string | null; message: string } => {
    const issues = validateCredentials(credentials);
    if (issues.length > 0) {
      return {
        payload: null,
        message: translate(language, VALIDATION_KEYS[issues[0]]),
      };
    }
    try {
      const payload = buildWifiPayload(credentials);
      buildQrCode(payload);
      return { payload, message: '' };
    } catch {
      return {
        payload: null,
        message: translate(language, 'validationQrTooLong'),
      };
    }
  }, [credentials, language]);

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead__top">
          <p className="masthead__mark">WLANQR</p>
          <div
            className="language-switch"
            role="group"
            aria-label={t('languageGroupLabel')}
          >
            {(['en', 'de'] as const).map((entry) => (
              <button
                key={entry}
                type="button"
                className="language-switch__button"
                aria-pressed={language === entry}
                onClick={() => setLanguage(entry)}
              >
                {entry.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <h1 className="masthead__title">{t('mastheadTitle')}</h1>
      </header>

      <main className="layout">
        <section className="panel" aria-labelledby={`${ids.ssid}-heading`}>
          <h2 className="panel__heading" id={`${ids.ssid}-heading`}>
            {t('networkDetailsHeading')}
          </h2>

          <div className="field">
            <label className="field__label" htmlFor={ids.ssid}>
              {t('ssidLabel')}
            </label>
            <input
              id={ids.ssid}
              className="field__input field__input--mono"
              type="text"
              value={ssid}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              onChange={(event) => setSsid(event.target.value)}
            />
            <p className="field__hint">{t('ssidHint')}</p>
          </div>

          <fieldset className="field field--group">
            <legend className="field__label">{t('securityLegend')}</legend>
            {SECURITY_OPTIONS.map((entry) => (
              <label className="choice" key={entry.id}>
                <input
                  type="radio"
                  name={ids.security}
                  value={entry.id}
                  checked={entry.id === optionId}
                  onChange={() => setOptionId(entry.id)}
                />
                <span>
                  <span className="choice__label">{t(entry.labelKey)}</span>
                  <span className="choice__hint">{t(entry.hintKey)}</span>
                </span>
              </label>
            ))}
          </fieldset>

          {needsPassword && (
            <div className="field">
              <label className="field__label" htmlFor={ids.password}>
                {t('passwordLabel')}
              </label>
              <div className="field__row">
                <input
                  id={ids.password}
                  className="field__input field__input--mono"
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-describedby={passwordDescription}
                  onPaste={(event) =>
                    setPasswordPasteNotice(
                      noticeAfterPasswordPaste(
                        event.clipboardData.getData('text'),
                      ),
                    )
                  }
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setPasswordPasteNotice(noticeAfterPasswordChange);
                  }}
                />
                <button
                  type="button"
                  className="button button--quiet"
                  aria-pressed={passwordVisible}
                  onClick={() => setPasswordVisible((value) => !value)}
                >
                  {t(passwordVisible ? 'hidePasswordInput' : 'showPasswordInput')}
                </button>
              </div>
              {passwordPasteNotice.visible && (
                <p
                  className="field__notice"
                  id={ids.passwordPaste}
                  role="status"
                >
                  {t('pasteWhitespaceNotice')}
                </p>
              )}
              <p className="field__hint" id={ids.hint}>
                {t('passwordHint')}
              </p>
            </div>
          )}

          <label className="toggle">
            <input
              type="checkbox"
              checked={hidden}
              onChange={(event) => setHidden(event.target.checked)}
            />
            <span>
              <span className="choice__label">{t('hiddenLabel')}</span>
              <span className="choice__hint">{t('hiddenHint')}</span>
            </span>
          </label>

          <label className="toggle">
            <input
              type="checkbox"
              checked={showPasswordOnCard}
              onChange={(event) => setShowPasswordOnCard(event.target.checked)}
              disabled={!needsPassword}
            />
            <span>
              <span className="choice__label">
                {t('showPasswordOnCardLabel')}
              </span>
              <span className="choice__hint">
                {t('showPasswordOnCardHint')}
              </span>
            </span>
          </label>
        </section>

        <section className="panel panel--output" aria-labelledby={ids.status}>
          <h2 className="panel__heading" id={ids.status}>
            {t('cardHeading')}
          </h2>

          {result.payload === null ? (
            <div className="placeholder" role="status">
              <p className="placeholder__label">{t('notReadyLabel')}</p>
              <p className="placeholder__body">{result.message}</p>
            </div>
          ) : (
            <>
              <div className="sheet">
                <WifiCard
                  ssid={ssid}
                  payload={result.payload}
                  hidden={hidden}
                  printedPassword={
                    showPasswordOnCard && needsPassword ? password : undefined
                  }
                  copy={{
                    ariaLabel: t('cardAriaLabel'),
                    eyebrow: t('cardEyebrow'),
                    instruction: t('cardInstruction'),
                    networkLabel: t('cardNetworkLabel'),
                    passwordLabel: t('cardPasswordLabel'),
                    hiddenNote: t('cardHiddenNote'),
                    qrLabel: formatTranslation(language, 'qrAriaLabel', { ssid }),
                  }}
                />
              </div>

              <div className="actions">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => window.print()}
                >
                  {t('printButton')}
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => downloadQrPng(result.payload as string)}
                >
                  {t('downloadQrButton')}
                </button>
                <p className="actions__hint">{t('actionsHint')}</p>
              </div>

              <p className="status" role="status">
                <span className="status__tag">{t('statusReadyTag')}</span>{' '}
                {t('statusReadyBody')}
              </p>
            </>
          )}
        </section>
      </main>

      <footer className="footer">
        <p className="footer__privacy">{t('privacyLead')}</p>
        <p className="footer__fineprint">{t('privacyDetail')}</p>
      </footer>
    </div>
  );
}
