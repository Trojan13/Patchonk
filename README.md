# Hikari Drop

Ein Three.js-/Cannon-es-Pachinko-Prototyp für eine Aufmerksamkeitsstudie. Die Oberfläche orientiert sich an einem farbigen japanischen Pachinko-Cabinet: roter Rahmen, gelbe Akzente, cyanfarbene Leuchtleisten und ein animierbares Anime-Display in der Mitte.

## Enthalten

- 3D-Board mit Kugeln, Pegs, Zielringen, Seitenrails und physikalischen Hindernissen
- Präzise Abschusskontrolle über Stärke und Winkel
- Roguelike-artiger Lauf mit transparentem Fortschritt und rein kosmetischen Freischaltungen
- Optionales Side-Lane-Panel für markierte Shorts-/Stream-Beobachtungsfenster; es lädt keine externen Feeds automatisch
- Hana-Charakterkarte mit Audio-Slot für bereitgestellte Sprachclips; keine Computerstimme und kein Autoplay
- Studien-Sicherheitsfunktionen: Pause, Session beenden, sichtbarer Timer, deaktivierbare Side Lane

## Start

```bash
npm install
npm run dev
```

Eigene Audio-Dateien können als `public/audio/hana-encouragement.ogg` ergänzt werden. Für eine Studie sollten Einwilligung, Session-Limits, Datenminimierung und eine echte Auswertungsschicht separat geprüft und dokumentiert werden.