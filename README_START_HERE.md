# DSG Network TapTap Maker — Android v0.2.0

## What changed
The main editor is now a perspective, animated Tap Tap-style highway, with coloured moving note balls, hit line, lane targets, music-time based animation, preview pattern, recording and press-and-hold note capture. The project, audio and selected-note controls remain available below the highway.

## Upgrade your existing GitHub project
On your GitHub repository, replace/add these exact files (preserve their folders):
- `app/src/main/assets/index.html`
- `app/src/main/assets/maker.js` (unchanged from v0.1)
- `app/src/main/assets/gameplay.js` **NEW**
- `app/build.gradle` (version 0.2.0)
- `.github/workflows/build-android.yml` (Android setup v4, Gradle 8.9)

You may upload the whole extracted `app` folder to replace matching files, then create `app/src/main/assets/gameplay.js` if the browser uploader omits it. Keep the workflow currently in your GitHub repo if it already builds successfully; only its artifact label is different.

GitHub Actions → Build DSG TapTap Maker APK → newest successful run → Artifacts → download `DSG-TapTap-Maker-Android-v0.2-debug-APK` ZIP → extract `app-debug.apk` → drag APK into Nox.

## How it works
1. Import an audio file from your emulator. Start playback.
2. Enable **Live record**. Press the coloured keys at the bottom of the animated highway in sync with the song to create taps; hold a pad for more than 0.32 seconds to create a hold.
3. Choose a Left/Right note tool before recording for directional notes.
4. Pause the song to touch the highway to select, erase or place notes in its visible future window.
5. Use BPM/snap, undo/redo and edit-note fields to correct notes; Export JSON to save a portable chart.
6. `Preview pattern` shows a demonstration without altering chart data. `Clear preview` returns to your notes.

## Current limitations
- **Not a verified Windows `.ttm` export**. Portable `.dsgmaker.json` is still the test format.
- Audio file must be re-imported after relaunch, as in v0.1.
- Hit accuracy and timing require emulator testing; visual animation is a real-time preview, not a calibrated rhythm gameplay engine.
- APK is not included: build via your existing working GitHub Actions repository.

The existing save/import/export Java and JS bridge was preserved. No VPS changes required.
