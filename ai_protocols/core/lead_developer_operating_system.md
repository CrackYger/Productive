# Lead Developer Operating System

## Zweck
Dauerhafte Arbeitsregeln und Architekturdisziplin für `Productive`.
Diese Datei gilt für alle Phasen und wird nur geändert, wenn sich grundlegende Arbeitsweise oder Stack-Entscheidungen ändern.

## Architektur-Grundregeln

### Verantwortungstrennung
- Präsentationslogik: Screen-Komponenten in `features/<domain>/components/`
- Produktlogik: Engine- und Orchestrierungslogik in `features/app/`
- Datenzugriff: Supabase-Zugriffe in Service-Modulen (`features/<domain>/services/`), nicht direkt in UI-Komponenten
- Typen: Zentral in `src/types.ts` — kein lokales Interface-Duplizieren

### Datei-Disziplin
- One-File-Per-Function: jede Komponente, jeder Service lebt in seiner eigenen Datei
- Keine Sammeldateien ohne klare Verantwortungsgrenze
- Keine riesigen Screen-Komponenten (> 400 Zeilen): splitten, wenn es unübersichtlich wird
- Gemeinsame UI-Bausteine einmal pflegen — Re-Exports erlaubt, Duplikate nicht

### Stack-Entscheidungen (verbindlich)
- Frontend: React 18 + TypeScript + Vite
- Backend: Supabase (Auth, PostgreSQL, Realtime, Storage)
- Deploy: Cloudflare Pages
- Server-Logik: Cloudflare Workers (kein Express für Produktionslogik)
- Styling: Tailwind CSS (geplant ab App-Phase)

## Entwicklungsphasen

### Phase 0 — Prototyp (aktuell)
- Reiner HTML/JSX-Prototyp, kein Build-Tool
- Ziel: Design validieren, Interactions testen, Produktlogik klären
- Kein echter Backend-Zugriff

### Phase 1 — Projekt-Setup & Core
- Vite + React + TypeScript aufsetzen
- Kern-Navigation (Tab-Bar), Basis-Datenhaltung lokal (useState/localStorage)
- Aufgaben-Management funktional (CRUD)
- Pflichtcheck: `npm run typecheck` + `npm run build` von Anfang an grün halten

### Phase 2 — Supabase-Integration
- Auth, Datenpersistenz, Sync
- Schema-Migrationen von Anfang an: jede Änderung als `.sql`-Migrationsdatei
- RLS von Anfang an: jede Tabelle absichern

### Phase 3 — Feature-Ausbau
- Lese-Tracker, Lern-Tracker
- Gamification-Tiefe

### Phase 4 — Social & Community (langfristig)
- Freunde, Challenges, Leaderboard

## Arbeitsregeln

### Vor jedem Code-Eingriff
1. `workflow_router.md` → passende Lesespur wählen
2. Passende `architecture/rules/`-Datei lesen, falls vorhanden
3. `anti_patterns.md` checken

### Bei Schema-Änderungen
- Migration schreiben + App-Code gleichzeitig anpassen — nie nur eines allein
- Migration gegen echtes Supabase-Projekt ausführen und verifizieren
- Stand in `supabase_migrations.schema_migrations` prüfen

### Bei neuen Features
- Zuerst `project_definition.md` und `roadmap.md` aktualisieren
- Dann implementieren
- Dann `verification_standards.md` befolgen

### Commit-Hygiene
- `npm run typecheck` + `npm run build` müssen grün sein
- Keine `any`-Typen ohne Begründung
- Kein auskommentierter Code im Commit

## Anti-Patterns (Kern)
Details → `core/anti_patterns.md`

- Kein `localStorage` für globale Produktwirkung
- Keine Permission-Prompts im normalen Nutzerfluss
- Keine Duplikate aktiver Wahrheit in mehreren Dateien
- Keine direkte Supabase-Abfrage aus UI-Komponenten
