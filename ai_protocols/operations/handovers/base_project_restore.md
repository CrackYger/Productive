# Base Project Restore

## Zweck
Anleitung zum Wiederherstellen einer funktionsfähigen Entwicklungsumgebung für `Productive` auf einem neuen Rechner.

## Prototyp-Phase (aktuell)

**Voraussetzungen:** Browser (Chrome / Safari)

1. Repo/Ordner klonen oder kopieren
2. `Productive.html` direkt im Browser öffnen
3. Alle drei Dateien müssen im selben Ordner liegen:
   - `Productive.html`
   - `ios-frame.jsx`
   - `tweaks-panel.jsx`
4. Fertig — kein Build-Schritt nötig

**Hinweis:** Die Skripte werden via `<script type="text/babel" src="...">` geladen. Babel Standalone und React werden via CDN geladen — Internetverbindung beim ersten Laden nötig.

---

## App-Phase (ab Phase 1 — noch nicht begonnen)

**Voraussetzungen:**
- Node.js ≥ 18
- npm ≥ 9
- Supabase-Projekt-Credentials (`.env`)

**Schritte:**
1. Repo klonen: `git clone <repo-url>`
2. Dependencies: `npm install`
3. `.env` aus Supabase-Dashboard befüllen:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
4. Dev-Server starten: `npm run dev`
5. Verifikation: `npm run typecheck` + `npm run build`

**Supabase-Migrationen:**
- Alle Migrationen liegen unter `supabase/migrations/`
- Gegen Supabase-Projekt ausführen via Supabase CLI oder Dashboard

---

## Umgebungs-Variablen (ab Phase 2)

| Variable | Zweck | Pflicht |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase Projekt-URL | Ja |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key | Ja |
| `VITE_VAPID_PUBLIC_KEY` | Web Push (optional) | Nein |
