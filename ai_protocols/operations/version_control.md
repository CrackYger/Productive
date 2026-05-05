# Version Control

## Versionsschema
`vMAJOR.MINOR.PATCH`

- `MAJOR`: Breaking Change, kompletter Rewrite oder neue Hauptphase
- `MINOR`: Neues Feature oder größerer Ausbau
- `PATCH`: Bug-Fix, kleine Verbesserung, Hotfix

## Aktueller Stand
- `v0.1.0` — Prototyp (`Productive.html`) fertiggestellt, Mai 2026

## Release-Prozess (ab App-Phase)
1. `updates/NEXT_PUSH.md` mit Changelog befüllen
2. `constants/version.ts` bumpen
3. `npm run typecheck` + `npm run build` grün
4. Git-Tag `vX.Y.Z` setzen
5. `updates/NEXT_PUSH.md` → `updates/vX.Y.Z.md` umbenennen
6. Deploy auf Cloudflare Pages

## Commit-Konventionen
- `feat:` — neues Feature
- `fix:` — Bug-Fix
- `refactor:` — Code-Änderung ohne Produktänderung
- `docs:` — nur Dokumentation
- `chore:` — Setup, Dependencies, Config

## Branch-Strategie (ab App-Phase)
- `main` — immer deploybar
- `feat/<name>` — Feature-Branches
- Kein direkter Push auf `main`
