import { startNewDraft } from './state.js';
import { init as initRender, openLoginDialog, startSessionWatch, unlockApp } from './render.js';
import { hasValidSession, resetAuthAttempts } from './auth.js';
import { CONFIG } from './config.js';

function init() {
  startNewDraft();
  initRender();
  if (CONFIG.AUTH_ENABLED) {
    startSessionWatch();
    if (hasValidSession()) {
      unlockApp();
    } else {
      openLoginDialog();
    }
  } else {
    resetAuthAttempts();
    unlockApp();
  }
}

init();