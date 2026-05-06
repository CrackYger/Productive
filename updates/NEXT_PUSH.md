# Nächstes Release — v0.2.0

## Änderungen

### UI / UX
- Tab-Leiste sitzt jetzt absolut am unteren Rand mit `safe-area-inset-bottom` und gleitet beim Öffnen einer Karte sanft heraus.
- Erstellungs-Karten (Aufgabe, Buch, Fach, Profil-Sheets) öffnen sich mittig im Bildschirm, blenden die Navigationsleiste aus und sind durchgängig scrollbar.

### Aufgaben
- Aufgabenkarten unterstützen jetzt Wischgesten: nach links für Teil-Fortschritt (`+x` Einheiten oder Skip), nach rechts für Löschen.
- Aufgaben können mit Einheit (`Seiten`, `Minuten`, `Anzahl`) und Zielmenge erstellt werden — Fortschritt und Restmenge erscheinen direkt auf der Karte.
- Kategorie und Tageszeit (`Morgens` / `Mittags` / `Abends` / `Ganzer Tag`) lassen sich pro Aufgabe festlegen.
- Auf der Startseite filtert eine neue Tageszeit-Leiste die Aufgabenliste.
- Lese-Aufgaben verlinken auf ein bestehendes Buch — wird die Aufgabe abgehakt oder ein Teil-Fortschritt eingetragen, aktualisiert sich der Lesestand des Buches automatisch.

### Bücher
- Neues Buch lässt sich mit Cover-Foto anlegen (auf max. 480 px komprimiert, JPEG-Re-Encoding).
- Cover wird in der Liste als kleines Thumbnail und im aufgeklappten Detail als großes Cover angezeigt.

### Schema
- Neue Migration `20260506100000_productive_v01_tasks_books.sql`:
  - `productive_tasks`: `unit`, `target_amount`, `progress_amount`, `time_of_day`, `category`, `book_id` ergänzt + Index auf `(user_id, time_of_day)`.
  - `productive_books`: `cover_url` ergänzt.

---

> Nach dem Release: Diese Datei umbenennen in `v0.2.0.md`.
