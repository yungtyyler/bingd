# bingd Mobile

React Native app for iOS and Android, built with Expo.

This app is product-only: signed-out users see native Clerk auth, and signed-in
users go straight to the dashboard, library, search, and settings.

## Local Setup

```bash
cp .env.example .env.local
npm run ios
```

When testing against your local Next.js app, set:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

Then run the backend from the repo root:

```bash
npm run dev:lan
```

`localhost` is automatically translated for Expo/Android where possible, but a
real phone still needs the backend available on your local network.

Required env vars:

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_API_BASE_URL`

The mobile app calls the existing Next.js backend and never connects directly to
the production database.
