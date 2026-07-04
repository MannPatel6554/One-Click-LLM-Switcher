// ============================================================
// One-Click LLM Switcher — popup.js
// ============================================================

const SUPPORTED_SITES = {
  'claude.ai':        { name: 'Claude', colorClass: 'color-claude', prefix: '◆', btnId: 'toClaude' },
  'chatgpt.com':      { name: 'ChatGPT', colorClass: 'color-chatgpt', prefix: '🤖', btnId: 'toChatGPT' },
  'gemini.google.com':{ name: 'Gemini', colorClass: 'color-gemini', prefix: '✦', btnId: 'toGemini' },
  'grok.com':         { name: 'Grok', colorClass: 'color-grok', prefix: '𝕏', btnId: 'toGrok' },
  'www.perplexity.ai': { name: 'Perplexity', colorClass: 'color-perplexity', prefix: '🔍', btnId: 'toPerplexity' }
};

const TARGET_URLS = {
  claude:  'https://claude.ai/new',
  perplexity: 'https://www.perplexity.ai/'
};

let currentAI = null;
let activeChatText = ""; // Hold scraped chat text globally

function setStatus(text, type = 'idle') {
  const dot  = document.getElementById('statusDot');
  const span = document.getElementById('statusText');
  span.textContent = text;
  dot.className = 'status-dot' + (type === 'active' ? ' active' : type === 'error' ? ' error' : '');
}

function setButtonLoading(btn, isLoading) {
  btn.classList.toggle('loading', isLoading);
  btn.disabled = isLoading;
}

// ─── CLIPBOARD HELPERS (SYNCHRONOUS USER GESTURE ONLY) ───────

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Fallback copy failed', err);
  }
  document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(err => {
      fallbackCopyTextToClipboard(text);
    });
  } else {
    fallbackCopyTextToClipboard(text);
    return Promise.resolve();
  }
}

// ─── INITIAL SCRAPING (Triggered immediately on popup open) ──

chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  const activeTab = tabs[0];
  const url = activeTab?.url || '';
  const detectedTitle = document.getElementById('detectedTitle');
  
  for (const [domain, info] of Object.entries(SUPPORTED_SITES)) {
    if (url.includes(domain)) { 
        currentAI = info; 
        break; 
    }
  }

  if (currentAI) {
    detectedTitle.textContent = `${currentAI.prefix} ${currentAI.name} detected`;
    detectedTitle.className = currentAI.colorClass;
    setStatus(`Loading ${currentAI.name} chat history...`, 'active');
    
    const currentBtn = document.getElementById(currentAI.btnId);
    if(currentBtn) currentBtn.classList.add('hidden-btn');

    // Scrape immediately!
    try {
      await chrome.scripting.executeScript({ target: { tabId: activeTab.id }, files: ['content.js'] }).catch(() => null);
      chrome.tabs.sendMessage(activeTab.id, { action: 'SCRAPE_CHAT' }, (response) => {
        if (response?.chat) {
          activeChatText = response.chat;
          setStatus(`${currentAI.name} chat loaded! Ready to copy/switch.`, 'active');
        } else {
          setStatus('No chat turns detected on this page.', 'error');
        }
      });
    } catch(e) {
      setStatus('Could not initialize scraper on this page.', 'error');
    }
  } else {
    detectedTitle.textContent = `⚠ AI site pe nahi hain`;
    detectedTitle.className = 'color-error';
    setStatus('AI chat page pe jaao phir switch karo', 'error');
    document.querySelectorAll('.btn').forEach(btn => { btn.disabled = true; });
  }
});

// ─── HISTORY DISPLAY ─────────────────────────────────────────

function timeSince(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds} sec ago`;
    return `${Math.floor(seconds / 60)} min ago`;
}

chrome.storage.local.get(['history'], (res) => {
    const historyText = document.getElementById('historyText');
    if(res.history && res.history.length > 0) {
        const last = res.history[0];
        historyText.textContent = `Last: ${last.from} → ${last.to} · ${timeSince(last.time)}`;
    }
});

// ─── SWITCH & COPY EVENT HANDLERS ────────────────────────────

function handleSwitch(targetId, btnId) {
  const btn = document.getElementById(btnId);
  setButtonLoading(btn, true);

  if (!activeChatText) {
    setStatus('Pehle chat load hone dein (1 second wait karein)', 'error');
    setButtonLoading(btn, false);
    return;
  }

  // 1. Copy to clipboard SYNCHRONOUSLY while user gesture is active!
  copyTextToClipboard(activeChatText).then(() => {
    // 2. Set chrome.storage (Async) and open tab
    chrome.storage.local.set({
      pendingChat: activeChatText,
      pendingTarget: targetId,
      savedAt: Date.now()
    }, () => {
      chrome.tabs.create({ url: TARGET_URLS[targetId] });
      
      // Save history
      const targetName = Object.values(SUPPORTED_SITES).find(s => s.btnId === btnId)?.name || targetId;
      chrome.storage.local.get(['history'], (res) => {
          const hist = res.history || [];
          hist.unshift({ from: currentAI ? currentAI.name : 'Unknown', to: targetName, time: Date.now() });
          chrome.storage.local.set({ history: hist.slice(0, 3) });
      });

      setStatus('✓ Copied to clipboard! Tab opening…', 'active');
      setTimeout(() => window.close(), 1200);
    });
  }).catch(() => {
    setStatus('Clipboard write failed.', 'error');
    setButtonLoading(btn, false);
  });
}

// Manual Copy Button Handler
document.getElementById('copyChatBtn').addEventListener('click', () => {
  const btn = document.getElementById('copyChatBtn');
  if (!activeChatText) {
    setStatus('Chat loading... wait 1 second', 'error');
    return;
  }

  // Copy synchronously in user click context
  copyTextToClipboard(activeChatText).then(() => {
    setStatus('✓ Copied successfully to clipboard!', 'active');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="icon">✓</span> Copied!';
    setTimeout(() => {
      btn.innerHTML = originalHTML;
    }, 2000);
  });
});

// Bind target AI buttons
document.getElementById('toClaude').addEventListener('click',  () => handleSwitch('claude',  'toClaude'));
document.getElementById('toPerplexity')?.addEventListener('click', () => handleSwitch('perplexity', 'toPerplexity'));
