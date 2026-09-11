# Build & Release — ELNADY

Commands to run the app locally and to build store binaries for Google Play and the App Store.

App identifiers:

| | |
|---|---|
| Expo slug / owner | `elnady` / `elnady79s-team` |
| EAS project ID | `e22f9716-3f14-4585-ab19-f79c2ae07570` |
| iOS bundle ID | `com.elnady.app` |
| Android package | `com.elnady.app` |
| Marketing version | `app.json` → `expo.version` (e.g. `1.0.0`) |
| iOS build number | `app.json` → `expo.ios.buildNumber` |
| Android versionCode | `app.json` → `expo.android.versionCode` |

Build config lives in [`eas.json`](eas.json). `appVersionSource` is `local`, so versions are read from `app.json`; the `production` profile has `autoIncrement: true`, which bumps `ios.buildNumber` and `android.versionCode` in `app.json` on every production build.

---

## 1. Run the app locally (development)

```bash
npm install
```

Start the Metro dev server (Expo Go / dev client):

```bash
npm start
```

Platform shortcuts:

```bash
npm run ios       # expo start --ios      (opens iOS simulator)
npm run android   # expo start --android  (opens Android emulator / device)
npm run web       # expo start --web
```

### Native local run (compiles the native project)

Requires Xcode (iOS) or Android Studio + SDK (Android). On this Mac, CocoaPods
needs a UTF-8 locale or `pod install` crashes:

```bash
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8
```

```bash
npx expo run:ios --device
```

```bash
npx expo run:android --device
```

Re-run `expo run:*` only when native deps or anything under `ios/` / `android/`
changes; otherwise just `npm start`.

### Backend (separate half, run from `backend/`)

```bash
cd backend && npm run dev     # nodemon
```

---

## 2. Before every store build — bump the version

Edit [`app.json`](app.json):

- Bump `expo.version` when the user-facing version changes (e.g. `1.0.0` → `1.0.1`).
- `production` builds auto-increment `ios.buildNumber` / `android.versionCode`,
  but commit that bump so the next build doesn't collide:

```bash
git add app.json && git commit -m "Bump version for release"
```

EAS builds from the committed git tree — make sure `main` is clean and pushed.

---

## 3. Android — build AAB for Google Play

Google Play requires an **App Bundle (`.aab`)**. The `production` profile produces one.

```bash
npx eas build --platform android --profile production
```

Add `--no-wait` to return immediately and track it on the dashboard instead of
streaming logs.

### Get the finished .aab

```bash
npx eas build:list --platform android --limit 1
```

Open the build URL from that output and click **Download**, or copy the
"Application archive" URL and pull it directly:

```bash
curl -L -o elnady.aab "<application-archive-url>"
```

### Upload to Google Play

Manual (no setup):

1. Play Console → **ELNADY** → **Test and release** → **Production** → **Create new release**.
2. Upload the `.aab` (Play App Signing re-signs it — no keystore prompt).
3. Fill release name + release notes → **Review release** → **Start rollout to Production**.

Automated (`eas submit`) — needs a Google Play service-account JSON key wired into
`eas.json` (`submit.production.serviceAccountKeyPath` + `track`), then:

```bash
npx eas submit --platform android --profile production --latest
```

### Android APK (only for sideload / non-Play stores)

```bash
npx eas build --platform android --profile preview
```

---

## 4. iOS — build for the App Store

```bash
npx eas build --platform ios --profile production
```

EAS handles signing with the Apple credentials stored on the Expo servers. This
produces an `.ipa` for App Store distribution.

### Submit to App Store Connect

```bash
npx eas submit --platform ios --profile production --latest
```

First run prompts for Apple sign-in (or an App Store Connect API key). After
upload, the build appears in App Store Connect → **TestFlight** in ~5–30 min;
attach it to a new version under **Distribution** and submit for review.

### Build both platforms at once

```bash
npx eas build --platform all --profile production
```

---

## 5. Release notes / constraints

- Project is on **Expo SDK 54** (`react-native` 0.81), targetSdk 36. See
  [`docs`](docs/) and `store-release` notes before upgrading the SDK.
- iOS App Review: the `subscription-2` flow sells course access via
  Vodafone Cash / InstaPay + WhatsApp, which conflicts with App Store
  Guideline 3.1.1. Confirm where App Review landed before resubmitting iOS.
- There is no automated test suite — verify builds by exercising the app.

---

## Quick reference

| Goal | Command |
|---|---|
| Dev server | `npm start` |
| Run iOS locally | `npx expo run:ios --device` |
| Run Android locally | `npx expo run:android --device` |
| Play Store build (AAB) | `npx eas build --platform android --profile production` |
| App Store build (IPA) | `npx eas build --platform ios --profile production` |
| Both stores | `npx eas build --platform all --profile production` |
| Sideload APK | `npx eas build --platform android --profile preview` |
| Submit Android | `npx eas submit --platform android --profile production --latest` |
| Submit iOS | `npx eas submit --platform ios --profile production --latest` |
| List builds | `npx eas build:list --limit 5` |
