# Verification Standards

## Zweck
Mindestvorgaben, die vor einer Änderung als „fertig" gilt, gelten müssen.

## Verifikationsklassen

### Klasse A — Prototyp-Änderungen (aktuell)
Jede Änderung an `Productive.html`, `ios-frame.jsx` oder `tweaks-panel.jsx`:

1. Browser-Test: `Productive.html` im Browser öffnen, golden path durchspielen
2. iOS-Frame prüfen: Darstellung im Device-Frame korrekt
3. Tweaks-Panel prüfen: Alle konfigurierbaren Werte (Farbe, Radius, Name) wirken durch
4. Animationen prüfen: Score-Ring-Fill, Check-Animation, Float-+10, Strike-Through
5. Add-Task-Modal: Aufgabe hinzufügen, Priorität wählen, Speichern → Aufgabe erscheint
6. Aufgabe abhaken → Done-State + Strikethrough + Float korrekt

### Klasse B — React-App-Änderungen (ab Phase 1)
Jede Änderung an Quell-Code in `src/`:

1. `npm run typecheck` — kein einziger TypeScript-Fehler
2. `npm run build` — kein Build-Fehler, keine Chunk-Warnungen über Schwellwert
3. Manueller Browser-Test: golden path (Aufgabe hinzufügen, abhaken, Score aktualisiert)
4. Edge Cases: leere Aufgabenliste, alle Aufgaben erledigt (Score 100)

### Klasse C — Schema-Änderungen (ab Phase 2)
Jede neue oder geänderte Supabase-Migration:

1. Migration gegen echtes Supabase-Projekt ausführen
2. Stand in `supabase_migrations.schema_migrations` prüfen
3. App-Code gleichzeitig aktualisiert (nie nur Migration ohne App-Code)
4. RLS-Policy getestet: Nutzer sieht nur eigene Daten
5. `npm run typecheck` + `npm run build` grün

### Klasse D — Auth- und Env-Änderungen (ab Phase 2)
1. Lokale `.env` vollständig (alle `VITE_`-Variablen gesetzt)
2. Build-Injektion prüfen: kein `placeholder.supabase.co` im ausgelieferten Bundle
3. Login-Flow vollständig durchspielen: Registrierung + Login + Session-Persistenz

## Pflichtprüfungen-Kurzliste

| Typ | Pflicht |
|---|---|
| Prototyp-Änderung | Browser-Test (Klasse A) |
| TypeScript-Datei | typecheck + build |
| Supabase-Migration | Klasse C vollständig |
| Auth/Env | Klasse D vollständig |
| Release | Klasse B + C + D |

## Was NICHT reicht
- "Es kompiliert" ohne Browser-Test
- Migration geschrieben ohne Ausführung gegen echte DB
- Lokaler Test ohne Deploy-Verifikation bei Env-Änderungen
