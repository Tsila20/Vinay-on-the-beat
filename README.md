# Vinay On The Beat — Release Firebase Android

Ity no version **release-ready**:
- app icon tena izy avy amin'ilay logo-nao
- splash screen tena izy
- Firebase chat stable
- GitHub Actions ho an'ny **signed APK** sy **signed AAB**
- Capacitor Android project

## Zava-dehibe
Tsy afaka manorina **signed APK/AAB tena izy** aho eto raha tsy misy:
1. **Firebase config**-nao
2. **Android release keystore**-nao
3. ireo **GitHub Secrets** ilaina

Nataoko anefa ny projet ho **release-ready**. Mila mameno fotsiny ianao dia afaka manamboatra signed build ao GitHub.

## 1) Firebase setup
Mamoròna projet Firebase dia alefaso:
- Authentication > enable **Email/Password**
- Firestore Database > create database
- Ampidiro ireo `.env` values ao amin'ny GitHub secrets na local `.env`
- Apetraho ao amin'ny repo ny `google-services.json` ao amin'ny `android/app/` rehefa vita ny `npx cap add android`

## 2) Local run
```bash
npm install
cp .env.example .env
npm run build
npm run android:add
npm run android:sync
npm run android:open
```

## 3) Generate Android icon/splash
Efa tafiditra ny sary:
- `branding/app-icon-1024.png`
- `branding/splash-2732.png`

Raha mila regen:
```bash
npm run assets:generate
```

## 4) GitHub signed build
Ao amin'ny GitHub repo:
- Settings > Secrets and variables > Actions
- Ampidiro ireto secrets ireto:

### Firebase
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_ADMIN_EMAIL`

### Android signing
- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Rehefa vita:
- Actions > **Build Signed Android Release** > Run workflow

Artifacts avoaka:
- `app-release.apk`
- `app-release.aab`

## 5) Fanamarihana fiarovana
Ny admin stable sy azo antoka amin'ny Firebase dia tsara kokoa amin'ny:
- admin email/password Firebase Auth
- Firestore rules
- tsy atao hardcoded secret ao anaty app release

## 6) Facebook / WhatsApp
Ao amin'ny app dia mbola misy direct links:
- Facebook profile
- WhatsApp chat
