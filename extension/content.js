(() => {
  if (window.hasRunLLMSwitcher) return;
  window.hasRunLLMSwitcher = true;

  const HOSTNAME = window.location.hostname;

  // ─── SCRAPER FUNCTIONS ───────────────────────────────────────

  function scrapeClaudeChat() {
    const messages = [];
    const turns = document.querySelectorAll('[data-testid="human-turn"], [data-testid="ai-turn"], .human-turn, .ai-turn, [class*="Human"], [class*="Claude"]');

    if (turns.length > 0) {
      turns.forEach(turn => {
        const roleText = turn.getAttribute('data-testid') || turn.className || '';
        const isHuman = roleText.toLowerCase().includes('human');
        const role = isHuman ? 'User' : 'Claude';
        const text = turn.innerText?.trim();
        if (text) messages.push(`${role}: ${text}`);
      });
    } else {
      const text = document.body.innerText?.trim();
      if (text) messages.push(`Extracted Text:\n${text}`);
    }

    return messages.join('\n\n---\n\n');
  }

  function scrapeChatGPTChat() {
    const messages = [];
    const turns = document.querySelectorAll('[data-message-author-role], .message, [class*="prose"]');

    if (turns.length > 0) {
      turns.forEach(turn => {
        const roleAttr = turn.getAttribute('data-message-author-role');
        let role = 'User';
        if (roleAttr) {
          role = roleAttr === 'user' ? 'User' : 'ChatGPT';
        } else {
          role = turn.className.includes('user') ? 'User' : 'ChatGPT';
        }
        const text = turn.innerText?.trim();
        if (text) messages.push(`${role}: ${text}`);
      });
    }
    return messages.join('\n\n---\n\n');
  }

  function scrapeGeminiChat() {
    const messages = [];
    const allTurns = document.querySelectorAll('user-query, model-response, .query-content, .message-content, [data-message-author-role]');
    
    if(allTurns.length > 0) {
       allTurns.forEach(turn => {
          const isUser = turn.tagName.toLowerCase().includes('user') || 
                         (turn.className && typeof turn.className === 'string' && (turn.className.includes('user') || turn.className.includes('query'))) ||
                         turn.getAttribute('data-message-author-role') === 'user';
          const role = isUser ? 'User' : 'Gemini';
          const text = turn.innerText?.trim();
          if (text) messages.push(`${role}: ${text}`);
       });
    }
    return messages.join('\n\n---\n\n');
  }

  function scrapeGrokChat() {
    const messages = [];
    const turns = document.querySelectorAll('[class*="message-bubble"], [data-testid*="message"], [class*="Message"], [class*="response"]');

    if (turns.length > 0) {
      turns.forEach(turn => {
        const isUser = turn.className.includes('user') || 
                       turn.getAttribute('data-testid')?.includes('user') || 
                       turn.innerText.includes('You');
        const role = isUser ? 'User' : 'Grok';
        const text = turn.innerText?.trim();
        if (text) messages.push(`${role}: ${text}`);
      });
    }
    return messages.join('\n\n---\n\n');
  }

  function scrapePerplexityChat() {
    const messages = [];
    const turns = document.querySelectorAll('.prose, [class*="answer"], [class*="user-message"], [data-testid*="answer"], .markdown');
    turns.forEach((el, i) => {
      const role = (i % 2 === 0) ? 'User' : 'Perplexity';
      if (el.innerText?.trim()) messages.push(`${role}: ${el.innerText.trim()}`);
    });
    return messages.join('\n\n---\n\n');
  }

  // ─── INJECTOR FUNCTIONS ──────────────────────────────────────

  function isVisible(el) {
    return el && el.offsetWidth > 50 && el.offsetHeight > 20;
  }

  function findStrictBox(selectors, shadowHostSelector = null) {
    const elements = Array.from(document.querySelectorAll(selectors)).filter(isVisible);
    
    if (shadowHostSelector) {
      document.querySelectorAll(shadowHostSelector).forEach(host => {
        if (host.shadowRoot) {
          const shadowElems = Array.from(host.shadowRoot.querySelectorAll(selectors)).filter(isVisible);
          elements.push(...shadowElems);
        }
      });
    }
    
    return elements.length > 0 ? elements[0] : null;
  }

  function ultimateInject(box, text) {
    box.focus();
    
    if (box.tagName === 'TEXTAREA' || box.tagName === 'INPUT') {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set ||
                           Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (nativeSetter) {
          nativeSetter.call(box, text);
      } else {
          box.value = text;
      }
    } else {
      try {
        box.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, text);
      } catch (e) {}
      
      if (!box.textContent.includes(text.substring(0, 5))) {
        try {
          box.innerText = text;
        } catch (e) {
          box.textContent = text;
        }
      }
    }

    ['input', 'change', 'keyup'].forEach(e => {
      box.dispatchEvent(new Event(e, { bubbles: true }));
    });
    
    const finalVal = box.value || box.textContent || '';
    return finalVal.includes(text.substring(0, 5));
  }

  function tryInjectLoop(selectors, text, shadowHost = null, maxRetries = 45) {
    const loop = (retries) => {
      const box = findStrictBox(selectors, shadowHost);
      
      if (box && ultimateInject(box, text)) {
        chrome.storage.local.remove(['pendingChat', 'pendingTarget']);
      } else if (retries > 0) {
        setTimeout(() => loop(retries - 1), 600);
      }
    };
    loop(maxRetries);
  }

  function injectToClaude(text) {
    tryInjectLoop('div.ProseMirror[contenteditable="true"], [contenteditable="true"][data-placeholder]', text);
  }

  function injectToPerplexity(text) {
    tryInjectLoop('textarea[placeholder*="Ask" i], textarea[placeholder*="follow-up" i], #ask-input [contenteditable="true"], [contenteditable="true"]#ask-input, #ask-input', text);
  }

  function injectToGemini(text) {
    tryInjectLoop('div.ql-editor[contenteditable="true"], rich-textarea div[contenteditable="true"]', text, 'rich-textarea');
  }

  function injectToGrok(text) {
    tryInjectLoop('div.ProseMirror[contenteditable="true"], div.tiptap[contenteditable="true"]', text);
  }

  function injectToChatGPT(text) {
    tryInjectLoop('div#prompt-textarea, textarea[placeholder*="message ChatGPT" i]', text);
  }

  // ─── LISTENER — background.js se message sunna ───────────────

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'SCRAPE_CHAT') {
      let chat = '';
      if (HOSTNAME.includes('claude.ai'))      chat = scrapeClaudeChat();
      if (HOSTNAME.includes('chatgpt.com'))    chat = scrapeChatGPTChat();
      if (HOSTNAME.includes('gemini.google'))  chat = scrapeGeminiChat();
      if (HOSTNAME.includes('grok.com'))       chat = scrapeGrokChat();
      if (HOSTNAME.includes('perplexity.ai'))  chat = scrapePerplexityChat();

      sendResponse({ chat: chat || '' });
      return true;
    }
  });

  // ─── TOAST NOTIFICATION FOR USER ────────────────────────────

  function showToast(message) {
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.backgroundColor = '#1a1a24';
    toast.style.color = '#00d4aa';
    toast.style.border = '1px solid #333';
    toast.style.padding = '14px 24px';
    toast.style.borderRadius = '10px';
    toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
    toast.style.zIndex = '999999999';
    toast.style.fontFamily = 'Segoe UI, -apple-system, BlinkMacSystemFont, sans-serif';
    toast.style.fontSize = '13px';
    toast.style.fontWeight = '600';
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.transform = 'translateY(10px)';
    toast.style.opacity = '0';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 400);
    }, 5000);
  }

  // ─── PAGE LOAD PE CHECK — kya inject karna hai? ──────────────

  chrome.storage.local.get(['pendingChat', 'pendingTarget'], (result) => {
    if (!result.pendingChat) return;

    const target = result.pendingTarget;
    let isCurrentTarget = false;
    
    if (target === 'claude'  && HOSTNAME.includes('claude.ai'))   isCurrentTarget = true;
    if (target === 'perplexity' && HOSTNAME.includes('perplexity.ai')) isCurrentTarget = true;
    if (target === 'gemini'  && HOSTNAME.includes('gemini.google')) isCurrentTarget = true;
    if (target === 'grok'    && HOSTNAME.includes('grok.com'))    isCurrentTarget = true;
    if (target === 'chatgpt' && HOSTNAME.includes('chatgpt.com'))  isCurrentTarget = true;

    if (isCurrentTarget) {
      showToast("⚡ LLM Switcher: Chat copied to clipboard! Press Ctrl+V if auto-paste doesn't trigger.");
      
      if (target === 'claude')  injectToClaude(result.pendingChat);
      if (target === 'perplexity') injectToPerplexity(result.pendingChat);
      if (target === 'gemini')  injectToGemini(result.pendingChat);
      if (target === 'grok')    injectToGrok(result.pendingChat);
      if (target === 'chatgpt') injectToChatGPT(result.pendingChat);
    }
  });

})();
