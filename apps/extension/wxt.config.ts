import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'MindPost - AI Conversation to LinkedIn Posts',
    description: 'Transform valuable ChatGPT insights into high-impact LinkedIn content.',
    version: '0.1.0',
    permissions: ['storage', 'activeTab'],
    host_permissions: [
      'https://chatgpt.com/*',
      'https://chat.openai.com/*'
    ],
    action: {
      default_title: 'MindPost'
    }
  }
});
