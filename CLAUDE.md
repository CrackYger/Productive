# CLAUDE.md — Productive

## Einstieg
**Jede Session beginnt mit:** `ai_protocols/core/workflow_router.md`

## Stack (Ist-Stand: Prototyp-Phase)
- Prototyp: React 18 (UMD), Babel Standalone, reines HTML/CSS — kein Build-Tool
- Geplanter App-Stack: React 18, TypeScript, Vite
- Styling: Tailwind CSS (geplant) / Inline-Styles (Prototyp)
- Font: Plus Jakarta Sans
- Backend (geplant): Supabase (Auth, DB, Realtime, Storage)
- Deploy (geplant): Cloudflare Pages
- Mobile: PWA (iOS + Android)

## Kernregeln
1. Dieselbe Wahrheit lebt in genau einer Datei — andere Dateien verlinken, nie duplizieren.
2. Neue Produktlogik nicht an Express koppeln — Zielbild ist Supabase + Cloudflare Workers.
3. Neue Querschnittslogik als Service oder Feature-Modul, nicht direkt in Screen-Komponenten.
4. `npm run typecheck` und `npm run build` sind Pflichtprüfungen vor jedem Commit.
5. Schema-Änderungen gelten erst als fertig, wenn Migration + App-Code gleichzeitig aktualisiert sind.
6. Kein `localStorage` für globale Produktwirkung — serverseitig persistieren.

## Code-Ort-Mapping (Zielstruktur)
- App-Shell & Routing: `features/app/`
- Screen-Komponenten: `features/<domain>/components/`
- Dienste: `features/<domain>/services/`
- Typen: `src/types.ts` (zentral)
- Supabase-Client: `src/supabaseClient.ts`
- Env-Utilities: `utils/env.ts`
- Konstanten: `constants/`

## Anti-Patterns (Kurzform)
- Kein `localStorage` für globale Produktwirkung — serverseitig persistieren.
- Keine Supabase-Selects, die optionale Spalten voraussetzen, ohne Fallback.
- Kein Permission-Prompt (Push/Camera) im normalen Nutzerfluss — nur über Einstellungen.
- Keine riesigen Sammeldateien ohne klare Verantwortungsgrenzen.
- Keine parallele aktive Pflege desselben Findings in `reviews/` und `roadmap.md`.

## Verifikation (Kurzform)
- Prototyp: Manuell im Browser auf `Productive.html` testen (Desktop + iOS-Frame)
- App-Phase: `npm run typecheck` + `npm run build` vor jedem Commit
- Schema-Änderung: Migration + App-Code + Verifikation in `supabase_migrations.schema_migrations`
- UI-Änderung: manuell auf iOS-PWA-Frame testen (golden path + edge case)

Details → `ai_protocols/core/verification_standards.md`
