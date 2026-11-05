# DSG Network TapTap Maker — Android v0.1.0 (first development build)

## What this is

An Android application project with a mobile touch-based chart editor, implemented as a local/offline WebView interface in a native Java Android app. This is an **early functional prototype**, not a complete Windows Maker port.

Built features:
- Three, four and five lane chart modes.
- Tap, hold, left-swipe and right-swipe notes; note selection, timing edits and deletion.
- Eight-second chart timeline, draggable hold placement, waveform preview where the device can decode the audio, grid snapping and BPM guide.
- Audio selection (MP3/WAV/M4A when supported by Android), playback and seeking.
- Live tap recording against the current audio playback position; undo and redo.
- Offline autosave inside the app and portable JSON project import/export through Android's file picker.
- Dark DSG-styled mobile interface and project metadata.

**Not yet included**: true native `.ttm` support; Windows-specific `.ttr2_track` output; a chart-playing gameplay engine; engine-specific note mechanics; DSG account sync; VPS downloads/update integration; app signing for general distribution. Engine selection here is project metadata ONLY. The Windows Studio installer contains a separate compiled `DSGTrackCore.exe` backend that handles Maker and the `.ttm` implementation isn't available as a documented source schema in the provided archive. We will need a real saved Windows Maker project and export for compatibility testing.

## Build APK without a Mac or a paid developer account

### Option A: GitHub Actions (no local Android SDK)
1. Create a free GitHub account/repository if you don't have one; create a private repository if you want the source private.
2. Upload **the contents of this project folder**, including the `.github` directory, to the repository root. Note: upload individual contents, not the outer ZIP as one file.
3. Open the repository's **Actions** tab. If prompted, enable GitHub Actions for this repository.
4. Select **Build DSG TapTap Maker APK** and choose **Run workflow** (or push to `main` to run automatically).
5. Open the finished run and download the **DSG-TapTap-Maker-Android-v0.1-debug-APK** artifact ZIP.
6. Extract it; inside will be `app-debug.apk`.
7. Drag the APK into **Nox Player** or use Nox's Install APK button to install it.

The free cloud-build allowance and policies are controlled by GitHub and may change; no Apple or Google Play developer membership is required for private emulator testing. The APK produced is a **debug build**, not a public signed release. Android's normal debug signing is applied by the Android build tools.

### Option B: Android Studio on Windows
1. Install Android Studio and SDK Platform 35, JDK 17 (bundled), and Gradle 8.9 if needed.
2. Open this folder as a Gradle project. If the IDE asks for a Gradle installation, use 8.9. There is intentionally no pre-generated `gradlew` wrapper included.
3. Sync and select **Build > Build APK(s)**.
4. Retrieve `app/build/outputs/apk/debug/app-debug.apk`.
5. Install in Nox by dragging the APK onto the emulator window.

## Using the app

1. Add title and artist, choose lane count and optional engine metadata.
2. Tap Import audio and select MP3/WAV/M4A from Android file picker.
3. Place a tap by tapping a lane on the chart. For holds, switch to Hold mode and drag up/down on the lane. Swipes use Left / Right modes.
4. Use `Earlier` and `Later` to move through eight-second timeline sections.
5. Press Play, enable Live record and tap the lane keys to record notes at the song's current time.
6. Press Export JSON to save a portable `.dsgmaker.json` chart using the Android document picker; use Open project to import one.
7. The editor autosaves chart metadata and notes. **Audio files are not bundled with JSON**; re-import the audio after relaunch/reimport.

## Compatibility and limitations

The exported format is `dsg-maker-portable-v1`, an interim schema created for this Android editor. It is not the same as Windows `.ttm`; don't rename it to `.ttm`. Audio playback accuracy and waveform decoding vary depending on the Android version/device. Nox needs Android 8.0+ to run this application (`minSdk 26`); use an Android 9 or newer Nox instance ideally. Project exports should be copied between devices via Files or USB for now. Browser-based playback uses HTML Audio timing; precision work and full live recording calibration remain future development tasks.

## Source layout

- `app/src/main/java/org/dsgnetwork/taptapmaker/MainActivity.java`: Android app window, native import/export file pickers.
- `app/src/main/assets/index.html`: mobile app interface.
- `app/src/main/assets/maker.js`: chart editing, timing, autosave and import/export logic.
- `app/src/main/AndroidManifest.xml`: app registration.
- `.github/workflows/build-android.yml`: optional GitHub-hosted APK build.

No network permissions are requested; this build works offline.
