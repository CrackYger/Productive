# Anti-Patterns

## Zweck
Diese Datei kondensiert die Präventionsregeln aus allen bisherigen Bug-Fixes und Architekturentscheidungen zu einem einzigen Lese-Einstieg.
Sie ist die schnelle Vorabprüfung, bevor neue Arbeit in einen bekannten Problemkorridor läuft.

Quellbasis: `bug_fixes/`, `architecture/rules/`, `core/lead_developer_operating_system.md`.

## Lesedisziplin
- Vor Eingriffen in **Auth, Push, Deploy, Env, Schema** zuerst diese Datei + den passenden Eintrag im `bug_fixes/INDEX.md` prüfen.
- Wenn ein neues dauerhaftes Anti-Pattern entsteht: hier eintragen **und** im Ursprungs-Bug-Fix vermerken.

---

## 1. Persistenz und Datenhaltung

- **Keine globale Produktwirkung via `localStorage`.**
  Funktionen, die alle Nutzer betreffen, müssen serverseitig in Supabase persistiert werden. `localStorage` darf nur als Cache/Fallback dienen.

- **Kein stilles Überschreiben von Nutzerdaten.**
  Import-Workflows, Sync-Operationen oder Migrationspfade brauchen explizite Nutzerentscheidung bei Datenkonflikten.

- **Migrationen werden nicht nur geschrieben, sondern gegen das echte Supabase-Projekt ausgeführt.**
  Nach Schema-Änderungen ist der Stand in `supabase_migrations.schema_migrations` zu verifizieren.

- **Schema-Änderungen gelten erst als fertig, wenn Migration + App-Code gemeinsam aktualisiert sind.**

---

## 2. Auth, Env und Deployment

- **`server.ts` nie davon ausgehen lassen, dass `.env` bereits in `process.env` liegt.**
  Serverseitige Dev-Entry-Pfade brauchen expliziten `.env`-Loader vor Kontext-Erstellung.

- **Frontend-Env nach Deploy immer am ausgelieferten Bundle verifizieren, nicht nur am lokalen Build.**
  Indikator für Fehler: `placeholder.supabase.co` im Live-Bundle.

- **Cloudflare-Pages-Production- und Preview-Variablen sind getrennt zu pflegen.**

---

## 3. Push und Service Worker (ab Phase 2)

- **Permission-Prompts gehören nicht in normale Nutzerflüsse.**
  Dashboard darf nicht ungefragt Browser-Permission anfragen. Opt-in läuft über den Settings-Flow.

- **Push-Subscription muss sauber abbrechen, wenn `VITE_VAPID_PUBLIC_KEY` fehlt.**

- **Vor Push-Registrierung werden Browser-Support, Secure Context, Service Worker und PushManager explizit geprüft.**

---

## 4. Architektur und Code-Struktur

- **Neue Produktlogik wird nicht an Express gekoppelt.**
  `server.ts` ist Übergangsschicht; Zielbild ist Cloudflare Workers.

- **Gemeinsame UI-Bausteine werden nur einmal gepflegt.**
  Re-Exports sind erlaubt, Duplikate nicht.

- **Neue Querschnittslogik als Service oder Feature-Modul, nicht direkt in Screen-Komponenten.**

- **Keine riesigen Sammeldateien ohne klare Verantwortungsgrenzen.**
  One-File-Per-Function bleibt Standard.

---

## 5. Gamification und Produktlogik

- **Keine inflationären Belohnungen.**
  XP und Score basieren auf echten Nutzeraktionen, nicht auf Schätzungen oder Dummy-Werten.

- **Score darf Produktivitäts-Wahrheit nicht verfälschen.**
  Gamification ist Verstärker, nicht Selbstzweck.

---

## 6. Dokumentation selbst

- **Keine parallele aktive Pflege desselben Findings in `reviews/` und `roadmap.md`.**
  `reviews/review_sammeldatei.md` ist nur Inbox. Nach Einsortierung verschwindet das Finding dort.

- **Historische Checklisten gehören nicht in die aktive Roadmap.**
  Erledigtes fliegt ins `roadmap_archive_*.md`.

- **Kleine Bugfixes werden nicht als eigener Roadmap-Block angelegt, wenn sie unter bestehende Arbeit fallen.**

---

## Pflege dieser Datei

- Neues Anti-Pattern entdeckt: hier eintragen mit Herkunftsverweis (Bug-Fix-Datei oder Architektur-Entscheidung).
- Anti-Pattern ist überholt (Technik ersetzt, Regel nicht mehr gültig): explizit streichen, nicht stillschweigend entfernen.
- Kurzfassung bleibt hier; Details bleiben in der Quelldatei.
