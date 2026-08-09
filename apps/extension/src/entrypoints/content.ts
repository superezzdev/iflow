import { defineContentScript } from 'wxt/sandbox';
import { ChatGPTParser } from '../parsers/chatgpt.parser';

export default defineContentScript({
  matches: ['https://chatgpt.com/*', 'https://chat.openai.com/*'],
  main() {
    console.log('[MindPost] Content script injected on ChatGPT page');

    const parser = new ChatGPTParser();

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'CHECK_CAN_PARSE') {
        const canParse = parser.canParse(window.location.href, document);
        sendResponse({ canParse });
        return true;
      }

      if (message.type === 'PARSE_CONVERSATION') {
        parser.parse(document)
          .then((result) => sendResponse(result))
          .catch((error) =>
            sendResponse({
              success: false,
              error: {
                code: 'PARSER_FAILED',
                message: error instanceof Error ? error.message : 'Unknown parsing error'
              }
            })
          );
        return true; // Keep channel open for async response
      }

      return false;
    });
  }
});
