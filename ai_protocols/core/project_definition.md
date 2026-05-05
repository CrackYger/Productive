# Projektdefinition — Productive

## Produktziel
`Productive` ist eine mobile Produktivitäts-App (PWA) für Schüler, Studenten und Selbstlerner.
Sie kombiniert Aufgaben-Tracking, Lese-Tracking und Lern-Tracking in einer gamifizierten Oberfläche.

## Module (Ist-Stand: Prototyp)

### 1. Home / Heute
- Tagesaufgaben mit Titel, optionaler Beschreibung und Priorität (hoch / mittel / niedrig)
- Score-Ring: prozentualer Tagesfortschritt (erledigte Arbeitssätze / Gesamt)
- Stats: Erledigt, Offen, Serien-Tage
- Motivation-Banner (optional, konfigurierbar)
- Neue Aufgabe hinzufügen (Bottom-Sheet-Modal)
- Aufgabe abhaken → +10 XP-Float-Animation

### 2. Lesen (Book-Tab)
- Lese-Tracker (geplant)
- Bücher / Artikel verfolgen, Seitenfortschritt loggen

### 3. Lernen (School-Tab)
- Lern-/Studiumstracker (geplant)
- Fächer, Lerneinheiten, Prüfungsvorbereitung

### 4. Profil
- Nutzerinformationen, Einstellungen, Statistiken (geplant)

## Design-Token (aus Prototyp)
- Akzentfarbe: `#6E56FF` (Lila)
- Grün: `#34C77B`
- Hintergrund: `#0d0d14` (Deep Navy)
- Font: Plus Jakarta Sans (400/500/600/700/800)
- iOS-Frame-Stil mit Liquid-Glass-Elementen

## Gamification
- Score-Ring: 0–100% Tagesfortschritt
- Serien-Tracker (Streak): wie viele Tage in Folge aktiv
- XP: +10 pro abgehakter Aufgabe (Float-Animation)
- Langfristig: Achievements, Badges, Leaderboard (geplant)

## Systemgrenzen
- MVP-Scope: Task-Management, Score, Streak — lokal
- Nächste Phase: Lese- und Lern-Tracker ausbauen
- Backend-Phase: Supabase-Integration (Auth, Persistenz, Sync)
- Social-Phase: Freunde, Leaderboard, Challenges (langfristig)

## Produktregeln
- Gamification darf Produktivitäts-Wahrheit nicht verfälschen — XP nur für echte Aktionen.
- Motivation-Banner sind optional und nutzerkonfigurierbar, nicht aufgezwungen.
- Aufgaben gehören dem Nutzer — kein automatisches Löschen, kein Datenverlust.
- Score berechnet sich aus tatsächlich erledigten Aufgaben, nicht aus Schätzungen.

## Datenmodell (Ziel, sobald Backend existiert)

```typescript
interface Task {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  priority: 'hoch' | 'mittel' | 'niedrig';
  done: boolean;
  date: string;           // ISO date — Tages-Zugehörigkeit
  created_at: string;
  updated_at: string;
}

interface DayStats {
  date: string;
  total_tasks: number;
  done_tasks: number;
  score: number;          // 0–100
  streak_day: number;
}
```

## Bekannte offene Fragen
- Aufgaben: tagesgebunden oder dauerhaft (Backlog)?
- Lese-Tracker: Bücher-Datenbank oder free-form Eingabe?
- Lern-Tracker: Fächer-Schema oder freie Kategorien?
- Gamification-Tiefe: nur Score & Streak, oder auch Trophäen und soziale Features?
