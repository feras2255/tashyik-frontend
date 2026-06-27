/**
 * The Nuxt app ships an integrated ChatbotButton + ChatWindow.
 * Production may still load public/tashyik-chat-bootstrap.js, which injects a
 * second floating toggle in the same corner — remove it and block re-injection.
 */
function removeLegacyChatWidgets() {
  document.getElementById('tashyik-chat-root')?.remove();
  document.getElementById('tashyik-chat-panel')?.remove();
  document.getElementById('tashyik-chat-critical-css')?.remove();
  document.querySelector('link[data-tashyik-chat-css]')?.remove();

  document
    .querySelectorAll('[id*="zsiq"], [class*="zsiq"], [id*="siq"], .siqembed, .zls-sptwndw, #zsiqwidget, #zsiq_float')
    .forEach((element) => element.remove());

  try {
    delete window.TashyikChatWidget;
  } catch {
    window.TashyikChatWidget = undefined;
  }
}

export default defineNuxtPlugin({
  name: 'suppress-legacy-chat',
  enforce: 'pre',
  setup() {
    if (import.meta.server) {
      return;
    }

    window.__TASHYIK_VUE_CHAT_ACTIVE__ = true;

    removeLegacyChatWidgets();

    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(() => {
        if (document.getElementById('tashyik-chat-root')) {
          removeLegacyChatWidgets();
        }
      }).observe(document.documentElement, { childList: true, subtree: true });
    }

    document.addEventListener('DOMContentLoaded', removeLegacyChatWidgets, { once: true });
  },
});
