import { defineBackground } from 'wxt/sandbox';

export default defineBackground(() => {
  console.log('[MindPost] Background service worker initialized');

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'PING') {
      sendResponse({ status: 'PONG', timestamp: Date.now() });
      return true;
    }
    return false;
  });
});
