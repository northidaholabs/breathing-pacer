# Breathing pacer

A breathing pacer for children, built with autistic children in mind. One shape rises on the in-breath and falls on the out-breath. Dots along the top show how many breaths are left.

This is version one, built from the must-have list in the research report (`~/reports/Breathing app design for autistic kids.md`). It has not been tested with children yet.

## Run it

Any static file server works. There is no build step and nothing to install.

```bash
python3 -m http.server 5190 --directory ~/Projects/breathing-pacer
```

Then open http://localhost:5190.

## What is in it

- `index.html`: the child screen and the grown-ups screen
- `styles.css`: three palettes (light, dark, warm) and the layout
- `app.js`: timing, the pacer, sound, settings
- `sw.js`: offline support after the first visit
- `guide.html`, `card.html`, `privacy.html`: printable guide, picture card and data statement (`pages.css` styles them)

## Decisions carried from the research

- Pace defaults to 10 breaths a minute, with age presets of 12, 10 and 9. An adult can set 7 to 14.
- Sessions are counted in breaths (default 5), not minutes.
- No breath holds. A short settle at the bottom of each breath.
- Sound starts on (changed after feedback; it was off at first). The speaker button turns it off. The calm sound is one soft sine tone, 165 to 220 Hz, with a hard volume ceiling.
- Only the shape moves. Still mode (or the device's reduced-motion setting) swaps movement for a fade with an arrow.
- A tap never stops a session by accident. Only the stop button or Escape does.
- No rewards, streaks, scores, accounts, analytics or third-party requests. Settings live in local storage.

## Added from the should-have list

- Five shapes (circle, balloon, rocket, whale, moon), five shape colours, four palettes including a low-contrast one.
- Optional child choice of shape on the child screen (two to four offered, last pick remembered).
- Voice that says "In" and "Out", using only on-device voices.
- Preset links: settings in the URL fragment, validated on load, never change whether sound is on.
- "Again" button on the finished screen, first-then picture strip, shrinking-circle timer.

## Added from the later list

- Press and hold mode: the child drives the shape, at their own speed, with no clock.
- Path pacers: figure of eight and a traced hand outline (thumb to little finger, then back).
- Optional step-down pace: starts up to 3 breaths a minute faster and eases to the set pace over the first 60% of breaths.
- Optional companion that swells gently with each breath.
- Own picture as the shape: cropped to 320 px in the browser, stored locally, never in a link.
- Quick setups: Quiet, Standard, More to see and hear.
- Optional per-day count of finished sessions, shown only on the grown-ups screen.
- Deliberately not built: anything using a microphone, sensors, accounts or sync. The research report treats those as legal decisions to make first.

## Added after first feedback: more fun by default

- Six animals with faces (frog, cat, puffer fish, penguin, bunny, monster). They puff up a little on the in-breath.
- Brighter shape colours, a rainbow option that changes colour each breath, and a sky palette.
- Fun noises: a slide whistle with the breath, a bloop as each breath lands, a short tune at the end. Each animal also has its own noise (ribbit, meow, bubbles, honk, boing, a goofy growl), played when it is picked and at the end. All made on the device from simple tones, no sound files. Same volume ceiling.
- Stars: each finished breath turns its dot into a star, and at the end the animal smiles and stars pop out. Nothing is counted or kept between sessions.
- New visitors get all of this. The Quiet and Standard quick setups go back to the plain circle, one colour and no stars.

## Not done yet

- Not tested on a real iPad or an old Chromebook.
- The voice option and offline use have not been checked on real devices.
- Privacy and health wording should get a lawyer's look before a public launch.
