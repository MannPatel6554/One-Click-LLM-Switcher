// ============================================================
// One-Click LLM Switcher — background.js (Service Worker)
// ============================================================

const TARGET_URLS = {
  claude:  'https://claude.ai/new',
  perplexity: 'https://www.perplexity.ai/'
};

async function executeContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
  } catch (err) {
    console.error("Content script injection failed", err);
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'SWITCH_TO') {
    const target = msg.target; 

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab?.id) return;

      try {
        let response = await chrome.tabs.sendMessage(activeTab.id, { action: 'SCRAPE_CHAT' }).catch(() => null);
        
        if (!response) {
          await executeContentScript(activeTab.id);
          response = await chrome.tabs.sendMessage(activeTab.id, { action: 'SCRAPE_CHAT' }).catch(() => null);
        }

        const chat = response?.chat || '';

        if (!chat) {
          sendResponse({ success: false, reason: 'no_chat', errorMsg: 'Is page pe koi chat nahi mili.' });
          return;
        }

        await chrome.storage.local.set({
          pendingChat: chat,
          pendingTarget: target,
          savedAt: Date.now(),
        });
        
        // Verify save
        const saved = await chrome.storage.local.get(['pendingChat']);
        if (!saved.pendingChat) {
          sendResponse({ success: false, reason: 'storage_error', errorMsg: 'Storage error — data save nahi hua.' });
          return;
        }

        await chrome.tabs.create({ url: TARGET_URLS[target] });
        sendResponse({ success: true, charCount: chat.length, chat: chat });

      } catch (err) {
        sendResponse({ success: false, reason: 'error', errorMsg: err.message });
      }
    });

    return true; 
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.local.get(['pendingChat', 'pendingTarget'], (result) => {
      if (result.pendingChat && result.pendingTarget) {
        executeContentScript(tabId);
      }
    });
  }
});

// ─── CLEANUP — 30 minutes baad stale data hata do ─────────────
chrome.storage.local.get(['savedAt'], (result) => {
  if (result.savedAt && Date.now() - result.savedAt > 1800000) { // 30 mins
    chrome.storage.local.remove(['pendingChat', 'pendingTarget', 'savedAt']);
  }
});
