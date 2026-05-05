# Bug Fix Index

## Zweck
Dieses Dokument ist der thematische Einstieg in `bug_fixes/`.
Bei Eingriffen in einen Bereich zuerst hier nachsehen — welche Incidents gab es bereits, welche Präventionsregeln gelten — bevor der Code berührt wird.

## Lese-Regel
- Scan: Tabelle unten nach Bereich/Tag filtern.
- Ziel: die 1–3 relevanten Dateien gezielt öffnen, nicht den ganzen Ordner.
- Wenn nichts passt: direkt in den Code, aber vorher `core/anti_patterns.md` prüfen.

## Tags
- `auth` — Authentifizierung, Login, Session
- `env` — Environment-Variablen, lokale Konfiguration
- `deploy` — Cloudflare, Build-Injektion, Live-Bundle
- `push` — Web Push, VAPID, Service Worker
- `tasks` — Task-CRUD, Prioritäten, Status
- `score` — Score-Berechnung, Streak, XP
- `reading` — Lese-Tracker
- `learning` — Lern-Tracker
- `schema` — Supabase-Migrationen, Spaltendefinitionen
- `ui` — Komponenten, Animationen, Layout

## Index

| Datum | Datei | Tags | Kernthema |
|---|---|---|---|
| — | — | — | Noch keine Incidents — Projekt in Prototyp-Phase |

## Benennung neuer Einträge

Bevorzugtes Schema:
- Bereich-spezifisch: `<thema>_<YYYY-MM-DD>.md` (z.B. `tasks_score_2026-06-01.md`)
- Release-gebunden: `v<MAJOR>_<MINOR>_<PATCH>_<kurz_thema>_<YYYY-MM-DD>.md`

Ein neuer Eintrag **muss** folgende Abschnitte haben:
1. Fehlerbild
2. Ursache
3. Behebung
4. Verifikation
5. Präventionsregel

Zusatzfälle desselben Themas dürfen an dieselbe Datei angehängt werden, getrennt durch `---` und `## Zusatzfall`.

## Pflege dieses Index

- Neuer Bug-Fix → gleichzeitig Zeile in der Tabelle.
- Datei umbenannt oder gelöscht → Tabelle synchron halten.
- Tag fehlt → neuen Tag in die Liste oben ergänzen, nicht in der Tabelle erfinden.

## Verbindung zu `core/anti_patterns.md`

Wenn eine Präventionsregel **systemübergreifend** gilt (nicht nur für den konkreten Bug), zusätzlich in `core/anti_patterns.md` eintragen mit Herkunftsverweis. Details bleiben in der Bug-Fix-Datei, die Kurzfassung lebt zentral.
