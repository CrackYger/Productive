# AI Protocols

## Zweck
`ai_protocols/` ist der verbindliche Arbeits- und Wissensordner für `Productive`.
Produktregeln, Architekturentscheidungen, Review-Erkenntnisse, Bug-Fixes und Betriebsprotokolle leben hier.

## Einstieg

**Für jede Session gilt:** Einstieg ausschließlich über `core/workflow_router.md`.

Das Root-Dokument `CLAUDE.md` (Repo-Root) verweist auf diesen Router und setzt die harten Kernregeln.
Lesespuren, Dokumentenbesitz und Update-Matrix werden **nicht mehr** hier dupliziert, sondern leben nur im Router.

## Struktur

- `core/` — Workflow, Arbeitsregeln, Produktdefinition, Verifikation, aktive Roadmap, Anti-Patterns
- `architecture/rules/` — dauerhafte Architekturregeln und Produktregeln
- `architecture/audits/` — datierte Snapshots, Phasen-Audits, historische Umsetzungsnotizen
- `bug_fixes/` — Incident-Log mit Ursache, Behebung und Präventionsregel; `INDEX.md` dient als Themen-Einstieg
- `reviews/` — temporäre Review-Inbox plus archivierte Audit-Stände
- `operations/` — Versionsregeln, Setup, Handovers, Betrieb

## Harte Regeln für diesen Ordner

- Dieselbe Wahrheit lebt in genau einer Datei. Andere Dateien verlinken, dupliziert wird nicht.
- Aktive Arbeit lebt in `core/roadmap.md`.
- `reviews/review_sammeldatei.md` ist Inbox, nicht Backlog.
- Release-Text lebt in `updates/`, nicht in `ai_protocols/`.
- Wenn eine kanonische Datei unübersichtlich wird: splitten, nicht anhängen.

## Wenn unklar ist, wo etwas hin gehört

1. Welche Datei ist laut Router zuständig?
2. Wer muss das später finden — Entwickler oder Audit?
3. Ist das dauerhaft oder datiert?

Antwort auf 3 entscheidet zwischen `architecture/rules/` und `architecture/audits/`.
