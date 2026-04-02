# GitHub Secrets ilaina

## Firebase secrets
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_MEASUREMENT_ID
- VITE_ADMIN_EMAIL
- GOOGLE_SERVICES_JSON_BASE64

`GOOGLE_SERVICES_JSON_BASE64` dia atao toy izao:
- amin'ny PC:
```bash
base64 -w 0 google-services.json
```
dia copié-nao ilay output manontolo ao amin'ny secret.

## Android signing secrets
- ANDROID_KEYSTORE_BASE64
- ANDROID_KEYSTORE_PASSWORD
- ANDROID_KEY_ALIAS
- ANDROID_KEY_PASSWORD

## Mamorona keystore
```bash
keytool -genkey -v -keystore release.keystore -alias vinayrelease -keyalg RSA -keysize 2048 -validity 10000
```

Avy eo encode:
```bash
base64 -w 0 release.keystore
```

Ataovy ao amin'ny secret `ANDROID_KEYSTORE_BASE64`.
