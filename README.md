# Composite Lodge No. 4076 — Lodge Manager

A self-contained lodge app that runs in the browser and installs to a phone home screen
or Windows taskbar. Hosted free on GitHub Pages.

**Live app:** https://rl1311.github.io/composite-lodge-crm/

- **Members** — name, contact, email, rank and office, ordered by rank seniority.
  A shareable details form (`?form` link) lets brethren enter their own details.
- **Meetings** — seasons 2026/27 → 2030/31, four meetings each (October, February,
  April, June) with meeting type, notes, to-do list and Festive Board notes.
- **Events** — committee (linked to Members; * marks non-members), details,
  to-do list and a committee chat.
- **Lodge Notices** — announcements with optional document attachments.
- **Photos** — links to a shared Google Photos album (once the lodge Google account exists).

## How data is shared
The app is protected by a lodge passcode. Shared data lives in the private repo
`composite-lodge-data`, read and written through the GitHub API with a fine-grained
token that is embedded in the app **encrypted with the lodge passcode**
(`sync-config.json`; PBKDF2 + AES-GCM). Members only ever type the passcode.
Press **⟳ Sync** on opening the app to pull everyone's changes and push yours.

`tools/encrypt-sync-token.py` produces `sync-config.json` from a token + passcode.
