# Workflow Router

## Zweck
Dieses Dokument ist der Einstiegspunkt für jede Session.
Es reduziert Leselast, verhindert doppelte Dokumentationsarbeit und ordnet jede Änderung genau einer kanonischen Dokumentenstelle zu.

Der allererste Einstieg liegt in `CLAUDE.md` im Repo-Root — dieser Router wird von dort referenziert.

## Grundprinzip
- Nicht mehr alles lesen, sondern nur den für die Aufgabe passenden Pfad.
- Nicht mehr dieselbe aktive Wahrheit in mehreren Dateien parallel pflegen.
- Nicht mehr jede Änderung mit dem gleichen Vollprozess behandeln.

## Kanonische Dokumentenbesitzer

- `CLAUDE.md` (Repo-Root)
  Harter Einstieg, Kernregeln, Stack, Verifikation (Kurzform), Code-Ort-Mapping, Anti-Patterns (Kurzform)
- `ai_protocols/core/workflow_router.md`
  Lesespuren, Update-Matrix, Dokumentenbesitz (dieses Dokument)
- `ai_protocols/core/lead_developer_operating_system.md`
  Dauerhafte Arbeitsregeln und Architekturdisziplin
- `ai_protocols/core/project_definition.md`
  Produktlogik, Module, Grenzen
- `ai_protocols/core/roadmap.md`
  Aktive, priorisierte, offene Arbeit
- `ai_protocols/core/verification_standards.md`
  Verifikationsklassen und Mindestchecks
- `ai_protocols/core/anti_patterns.md`
  Kondensierte Präventionsregeln aus Bug-Fixes und Architektur
- `ai_protocols/architecture/rules/`
  Dauerhafte technische und fachliche Architekturregeln
- `ai_protocols/architecture/audits/`
  Datierte Snapshots, Phasen-Audits, historische Umsetzungsnotizen
- `ai_protocols/bug_fixes/INDEX.md`
  Thematischer Einstieg in Bug-Fix-Historie
- `ai_protocols/bug_fixes/<datei>.md`
  Einzelner Incident mit Ursache, Lösung und Präventionsregel
- `ai_protocols/reviews/review_sammeldatei.md`
  Inbox für neue, noch nicht einsortierte Findings
- `ai_protocols/operations/`
  Setup, Handover, Versionierung und Betrieb

## Lesespuren

### 1. Kleiner Bug in bekanntem Bereich
Lesen:
- dieses Dokument
- `bug_fixes/INDEX.md` → zugehörigen Eintrag
- passende Datei unter `architecture/rules/`, falls dort Regeln für den Bereich liegen
- `core/anti_patterns.md`
- `core/verification_standards.md`

Aktualisieren:
- in der Regel nur `bug_fixes/` (+ INDEX-Zeile)
- `core/anti_patterns.md` nur, wenn die Präventionsregel systemübergreifend gilt
- `architecture/rules/` oder `project_definition.md` nur, wenn sich die dauerhafte Regel ändert
- `roadmap.md` nur, wenn Priorität oder offene Arbeit sich dadurch ändert

### 2. Neues Feature oder größerer Refactor
Lesen:
- dieses Dokument
- `core/lead_developer_operating_system.md`
- `core/project_definition.md`
- `core/roadmap.md`
- passende Dateien unter `architecture/rules/`
- `core/anti_patterns.md`

Aktualisieren:
- `project_definition.md` bei echter Produktlogik-Änderung
- `roadmap.md` bei neuer oder veränderter aktiver Arbeit
- `architecture/rules/` bei neuer dauerhafter Architekturentscheidung
- `architecture/audits/` bei einem datierten Umsetzungs-Snapshot, der später als Kontext gebraucht wird

### 3. Schema-, RPC-, RLS- oder Datenflussarbeit
Lesen:
- dieses Dokument
- `core/lead_developer_operating_system.md`
- `core/project_definition.md`
- passende Dateien unter `architecture/rules/` und ggf. `bug_fixes/INDEX.md`
- `core/anti_patterns.md`
- `core/verification_standards.md`

Aktualisieren:
- `architecture/rules/` für neue Daten- oder Sicherheitsregel
- `bug_fixes/` (+ INDEX-Zeile), wenn ein realer Incident gelöst wurde
- `roadmap.md`, wenn offene Folgearbeit entsteht oder Prioritäten sich verschieben

### 4. Release, Changelog oder Versionspflege
Lesen:
- dieses Dokument
- `operations/version_control.md`
- `core/verification_standards.md`

Aktualisieren:
- `updates/NEXT_PUSH.md`
- `updates/vX.Y.Z.md`
- `constants/version.ts`
- zusätzlich nur die fachlich zuständige Datei in `ai_protocols/`, wenn mehr als Release-Text betroffen ist

### 5. Setup, Handover oder Rechnerwechsel
Lesen:
- dieses Dokument
- `operations/handovers/base_project_restore.md`

### 6. Fallback — unklare Aufgabe
Wenn keine der Lesespuren 1–5 eindeutig passt:
- zurück zum Nutzer mit kurzer Klärungsfrage
- nicht auf Verdacht die Voll-Leseliste laden

## Update-Matrix

### Wann `core/project_definition.md`?
- Wenn Produktlogik, Systemgrenzen oder fachliche Realität sich ändern
- Nicht für reine technische Refactors ohne Produktfolge

### Wann `core/roadmap.md`?
- Wenn neue aktive Arbeit priorisiert wird
- Wenn Reihenfolge, Umfang oder Blocker der offenen Arbeit sich ändern
- Nicht für jeden kleinen Bugfix, der bereits logisch unter bestehende Arbeit fällt

### Wann `architecture/rules/`?
- Wenn eine dauerhafte Architekturentscheidung oder technische Produktregel festgelegt wird
- Leitfrage: „In zwölf Monaten noch aktiv steuernd?" → ja

### Wann `architecture/audits/`?
- Wenn ein datierter Snapshot, ein Phasen-Audit oder eine Umsetzungsnotiz als Kontextgedächtnis festgehalten wird
- Leitfrage: „In zwölf Monaten noch aktiv steuernd?" → nein, aber historisch nützlich

### Wann `bug_fixes/`?
- Wenn ein größerer Bug mit Ursache, Behebung, Verifikation und Präventionsregel sauber dokumentiert werden soll
- Gleichzeitig Zeile in `bug_fixes/INDEX.md` ergänzen
- Nicht für laufende Backlog-Punkte ohne gelernte Incident-Erkenntnis

### Wann `core/anti_patterns.md`?
- Wenn eine Präventionsregel systemübergreifend gilt (nicht nur für den konkreten Bug)
- Mit Herkunftsverweis auf die Quell-Bug-Fix-Datei oder Architektur-Entscheidung
- Details bleiben in der Quelle, Kurzfassung lebt zentral

### Wann `reviews/review_sammeldatei.md`?
- Nur kurzzeitig bei neu entdeckten Findings, die noch nicht eingeordnet sind
- Nicht als dauerhafte zweite Aufgabenliste

## Was ab jetzt bewusst wegfällt
- Pauschaler Voll-Read aller Kern- und Nebendokumente bei jeder Session
- Doppelte aktive Pflege von Findings in `reviews/` und `roadmap`
- Historische erledigte Checklisten in der aktiven Roadmap
- Parallele Pflege derselben Lesespuren in `README.md` und hier

## Entscheidungsregel bei Unsicherheit
Wenn eine Information gleichzeitig in zwei aktive Dateien könnte:
1. Wo liegt die kanonische Wahrheit für diese Art von Information?
2. Welche Datei muss später wirklich gefunden und gepflegt werden?
3. Alle anderen Dateien verlinken oder referenzieren nur, statt dieselbe Wahrheit zu duplizieren.
