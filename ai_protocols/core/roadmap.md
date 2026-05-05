# Roadmap — Productive

**Stand:** Mai 2026 | **Version:** 0.1 (Prototyp-Phase)

---

## Aktiver Stand

Der Prototyp (`Productive.html`) ist fertig und zeigt:
- Home-Screen mit Score-Ring, Tagesaufgaben, Stats (Erledigt / Offen / Streak)
- Add-Task-Modal (Bottom Sheet) mit Prioritäts-Auswahl
- Task-Interaktionen: Abhaken mit +10-Float-Animation, Strikethrough, Löschen
- Motivation-Banner (konfigurierbar)
- Tab-Navigation: Home, Buch, Schule, Profil (nur Home voll implementiert)
- iOS-Device-Frame mit Liquid-Glass-Effekten
- Tweaks-Panel für Live-Design-Anpassungen

---

## Phase 1 — Projekt-Setup (nächster Schritt)

### 1.1 Vite + React + TypeScript aufsetzen
- `npm create vite@latest` mit React-TypeScript-Template
- Tailwind CSS konfigurieren
- Plus Jakarta Sans einbinden
- `npm run typecheck` + `npm run build` von Anfang an grün halten

### 1.2 Basis-Struktur anlegen
```
src/
  features/
    app/                    ← Shell, Routing, Tab-Navigation
    tasks/                  ← Task-Management
    reading/                ← Lese-Tracker (leer)
    learning/               ← Lern-Tracker (leer)
    profile/                ← Profil-Screen (leer)
  types.ts                  ← Zentrale Typen
  supabaseClient.ts         ← (leer, für später)
  utils/env.ts
constants/
  version.ts
```

### 1.3 Prototyp → App portieren
- iOS-Frame + Tweaks-Panel portieren oder durch echtes Responsive-Layout ersetzen
- Alle Icons als Komponenten (aktuell SVG inline)
- ScoreRing als wiederverwendbare Komponente
- TaskItem + AddTaskModal portieren

### 1.4 Lokaler State (kein Backend)
- Aufgaben-CRUD mit `useState` + `localStorage` als Fallback
- Streak-Berechnung lokal
- Score-Berechnung lokal

---

## Phase 2 — Supabase-Integration

### 2.1 Auth
- Email/Passwort + Magic Link
- Session-Management in `features/app/`

### 2.2 Task-Persistenz
- `tasks`-Tabelle in Supabase
- RLS: Nutzer sieht nur eigene Aufgaben
- Sync: lokal first, dann Supabase

### 2.3 Streak & Stats
- `day_stats`-Tabelle für tagesgebundene Aggregationen

---

## Phase 3 — Lese- und Lern-Tracker

- Book-Tab: Bücher anlegen, Seitenfortschritt loggen
- School-Tab: Fächer, Lerneinheiten, Prüfungstermine

---

## Phase 4 — Gamification-Tiefe

- Achievements / Trophäen
- Erweiterte XP-Logik
- Badges

---

## Phase 5 — Social (langfristig)

- Freunde, Challenges, Leaderboard

---

## Offene Produktfragen (vor Phase 1 klären)

| Frage | Priorität |
|---|---|
| Aufgaben tagesgebunden oder dauerhafter Backlog? | 🔴 Hoch |
| Lese-Tracker: Bücher-DB oder free-form? | 🟠 Mittel |
| Lern-Tracker: Fächer-Schema oder freie Kategorien? | 🟠 Mittel |
| Gamification-Tiefe: Score & Streak genug für MVP? | 🟡 Niedrig |
