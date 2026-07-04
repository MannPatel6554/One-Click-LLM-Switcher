# ⚡ One-Click LLM Switcher (Claude ↔ Perplexity)

> **Claude pe baat ki, Perplexity pe switch karna hai? Ek click karo — baat wahi se shuru hogi.**

[![⚡ LIVE DEMO](https://img.shields.io/badge/⚡%20LIVE%20DEMO-Website-blue?style=flat-square)](http://localhost:4000)
![Version](https://img.shields.io/badge/version-1.1.0-6c63ff?style=flat-square)
![Manifest](https://img.shields.io/badge/Manifest-v3-00d4ff?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 📦 Changelog

- **v1.1.0:** Focused purely on **Claude** and **Perplexity** support for maximum reliability, complete with a manual "Copy Chat" fallback button.

---

## 🤔 Ye Kya Hai?

Ek Chrome Extension jo aapki **poori conversation** Claude se Perplexity (aur vice-versa) mein **ek click mein** le jaata hai — bina copy-paste ke, bina kuch bhule.

**Supported AI Platforms:**
| Platform | Scraping | Injection |
|----------|----------|-----------|
| ◆ Claude    | ✅ | ✅ |
| 🔍 Perplexity| ✅ | ✅ |

---

## 🚀 Quick Install (Developer Mode)

```bash
# 1. Repo clone karo
git clone https://github.com/yourname/llm-switcher.git
cd llm-switcher/extension

# 2. Chrome mein jaao
# chrome://extensions/

# 3. "Developer Mode" ON karo (top-right toggle)

# 4. "Load Unpacked" pe click karo aur /extension folder select karo

# 5. Extension tray mein ⚡ icon aajayega!
```

---

## 🔧 Troubleshooting
   
| Problem | Solution |
|---------|----------|
| Chat inject nahi ho rahi | Extension popup par click karke manually "Copy Current Chat" kar sakte hain, aur page par Ctrl+V kar dein |
| Buttons disabled hain | AI chat page pe jaao (claude.ai ya perplexity.ai) |
| Extension icon nahi dikh raha | chrome://extensions pe jaao, extension enabled hai? |

---

## ⚙️ Kaise Kaam Karta Hai?

```text
User Claude pe hai
        │
        ▼
    [⚡ Icon Click]
        │
        ▼
  Popup khulta hai → "Perplexity" button click
        │
        ▼
  popup.js → Chat scrape karke clipboard mein copy karega (Synchronously)
        │
        ▼
  background.js → New tab khulega Perplexity ka
        │
        ▼
  content.js → Perplexity par auto-paste karega
```

---

## 📁 File Structure

```text
backend/
├── schema.sql         # Supabase SQL Schema
├── supabase_client.js # Supabase client implementation

extension/
├── manifest.json      # Extension ki permissions aur config
├── background.js      # Service worker — tab management
├── content.js         # DOM scraper + injector (Claude & Perplexity)
├── popup.html         # Extension ka UI popup
├── popup.js           # Button click handlers
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png

website/
├── index.html         # Landing page
└── llm-switcher-extension.zip # Compiled package
```

---

## 📄 License

MIT — Karo jo chahein, bas credit dena mat bhulio! 😄

---

*Made with ⚡ | Zero servers, infinite switches*
