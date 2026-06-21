**A highly recommended core plugin for a smarter and feature-rich bot.**  
This plugin serves as the central nervous system for your WhatsApp bot, providing all the essential administrative and utility features required to manage the bot effectively. 

Installing this plugin is highly recommended to give your bot a solid foundation before adding other complex features.

---

## 🌟 Highlight Features

### 🔤 Dynamic Prefix Management
A powerful dynamic prefix system that keeps your bot flexible across different groups.
- **`!prefix [list|add|del]`** - Dynamically manage main command prefixes (e.g., `!`, `/`, `.`) without needing to restart the bot or edit the source code.
- **🚀 Non-Prefix Commands (Developer Tools)** - As part of the dynamic prefix system, the bot owner gets exclusive access to non-prefix backend tools:
  - **`$ <code>`** (Eval) - Evaluate asynchronous JavaScript code directly in the chat. Perfect for quick debugging or testing APIs.
  - **`~ <command>`** (Exec) - Execute terminal commands on the host server directly from WhatsApp.

### 👑 Owner & Access Control
- **`!owner [list|add|del]`** - Manage bot owners dynamically. Owners have exclusive access to administrative commands.
- **`!mode [public|private]`** - Toggle the bot's availability. In `private` mode, the bot will silently ignore messages from non-owners.

### 🚪 Group Management (Owner Only)
Have full control over which groups your bot is in:
- **`!join <invite-link>`** - Make the bot join a new group via a WhatsApp invite link.
- **`!leave`** - Order the bot to immediately leave the current group.

### 🛡️ Security & Moderation
- **`!ban [list|add|del]`** - Blacklist abusive users. The bot will automatically ignore any requests from banned users.
- **`!block / !unblock`** - Permanently block or unblock users at the WhatsApp account level.

### 📊 Monitoring & Utility
- **`!stats`** (or `!ping`) - Check the bot's real network latency, NodeJS version, OS information, Uptime, and RAM usage.
- **`!fetch <url>`** - Quickly fetch and inspect API data (JSON/Text) directly from WhatsApp.

---

## 🌍 Multi-Language Support (i18n)
This plugin features built-in multi-language support. All bot responses are cleanly separated from the logic and can be customized in the `lang/` directory:
- `lang/id.json` (Indonesian)
- `lang/en.json` (English)

*All texts have been carefully curated to be clean, minimalist, and professional.*

---

## 🛠️ Installation

Installation is incredibly simple. Just run the following command in your bot's CLI:
```bash
plugin:install @lazy/basic
```

Because this is a core plugin, it utilizes native `lazybot` middlewares (like `priority: -99` for ban guards) to ensure security checks are executed before any other plugins.
