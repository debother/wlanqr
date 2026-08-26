export interface PasswordPasteNoticeState {
  readonly visible: boolean;
  /** Preserve the result through the input event caused by this paste. */
  readonly keepThroughNextChange: boolean;
}

export const INITIAL_PASSWORD_PASTE_NOTICE: PasswordPasteNoticeState = {
  visible: false,
  keepThroughNextChange: false,
};

/** Inspect pasted text without returning, storing, or changing credential data. */
export function noticeAfterPasswordPaste(
  pastedText: string,
): PasswordPasteNoticeState {
  return {
    visible: /\s/u.test(pastedText),
    keepThroughNextChange: true,
  };
}

/** Keep the notice for the paste-generated change; clear it on a later edit. */
export function noticeAfterPasswordChange(
  state: PasswordPasteNoticeState,
): PasswordPasteNoticeState {
  if (state.keepThroughNextChange) {
    return { visible: state.visible, keepThroughNextChange: false };
  }
  return INITIAL_PASSWORD_PASTE_NOTICE;
}
