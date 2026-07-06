# ⚡ One-Click LLM Switcher (Claude ↔ Perplexity ↔ ChatGPT ↔ Gemini ↔ Grok)

> **Talking to one AI platform but want to switch to another? Click once — and pick up right where you left off.**

[![⚡ LIVE DEMO](https://img.shields.io/badge/⚡%20LIVE%20DEMO-Website-blue?style=flat-square)](http://localhost:4000)
![Version](https://img.shields.io/badge/version-1.0.0-6c63ff?style=flat-square)
![Manifest](https://img.shields.io/badge/Manifest-v3-00d4ff?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 📦 Changelog

- **v1.0.0:** Enabled target redirection & auto-injection for **Claude, ChatGPT, Gemini, Grok, & Perplexity** (Full 5-way switching in any direction).

---

## 🤔 What Is This?

A Chrome Extension that transfers your **entire active conversation thread** to another AI platform in a single click — without manual copying and pasting or losing context.

**Supported AI Platforms:**
| Platform | Scraping | Injection |
|----------|----------|-----------|
| ◆ Claude    | ✅ | ✅ |
| 🔍 Perplexity| ✅ | ✅ |
| 🤖 ChatGPT   | ✅ | ✅ |
| ✦ Gemini    | ✅ | ✅ |
| 𝕏 Grok      | ✅ | ✅ |

---

## 🚀 Quick Install (Developer Mode)

```bash
# 1. Clone the repository
git clone https://github.com/yourname/llm-switcher.git
cd llm-switcher/extension

# 2. Open Google Chrome and navigate to:
# chrome://extensions/

# 3. Enable "Developer Mode" (toggle in the top-right corner)

# 4. Click "Load Unpacked" and select the /extension directory

# 5. The ⚡ icon will appear in your extension tray!
```

---

## 🔧 Troubleshooting
   
| Issue | Solution |
|-------|----------|
| Chat doesn't inject automatically | Click the extension popup and manually select "Copy Current Chat", then press Ctrl+V inside the input field |
| Buttons are disabled | Make sure you are on a supported active chat page (claude.ai, perplexity.ai, gemini.google.com, grok.com, chatgpt.com) |
| Extension icon doesn't appear | Go to chrome://extensions and verify that the extension toggle is active |

---

## ⚙️ How It Works

```text
User is on an active AI chat thread
        │
        ▼
    [⚡ Click Extension Icon]
        │
        ▼
  Popup opens → Select target AI (e.g., Gemini)
        │
        ▼
  popup.js → Scrapes active thread and writes to clipboard (Synchronously)
        │
        ▼
  background.js → Opens new tab with the target AI URL
        │
        ▼
  content.js → Automates key input injection into the target input field
```

---

## 📁 File Structure

```text
backend/
├── schema.sql         # Supabase database schema definition
├── supabase_client.js # Supabase connection client implementation

extension/
├── manifest.json      # Extension config, permissions, & metadata
├── background.js      # Service worker handling tab/navigation states
├── content.js         # DOM scraper & target injector modules
├── popup.html         # Premium glassmorphic extension UI popup
├── popup.js           # UI interaction & event listeners
└── icons/
    ├── icon16.png     # Resized extension vector icons
    ├── icon48.png
    └── icon128.png

website/
├── index.html         # Interactive landing page mockup
└── llm-switcher-extension.zip # Production extension package
```

---

## 📄 License

MIT — Feel free to use, modify, and distribute, just don't forget to give credit! 😄

---

*Made with ⚡ | Zero servers, infinite switches*
