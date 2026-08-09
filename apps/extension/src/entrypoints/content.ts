import { defineContentScript } from 'wxt/sandbox';
import { ChatGPTParser } from '../content/chatgpt/parser';

export default defineContentScript({
  matches: ['https://chatgpt.com/*', 'https://chat.openai.com/*'],
  main() {
    const parser = new ChatGPTParser();

    /**
     * Dedicated message listener for explicit capture actions initiated from popup.
     * MindPost strictly captures on explicit user intent only.
     */
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'CHECK_PAGE_STATUS') {
        const canParse = parser.canParse(window.location.href, document);
        sendResponse({
          isChatGPT: canParse,
          canCapture: canParse,
          url: window.location.href,
          title: document.title
        });
        return true;
      }

      if (message.type === 'CAPTURE_CONVERSATION') {
        // Execute isolated ChatGPT DOM parser
        parser.parse(document, window.location.href)
          .then((result) => {
            sendResponse(result);
          })
          .catch((error) => {
            sendResponse({
              success: false,
              error: {
                code: 'PARSER_FAILED',
                message: error instanceof Error ? error.message : 'Unknown parsing error'
              }
            });
          });

        return true; // Keep channel open for async response
      }

      return false;
    });
  }
});
