# bingd Mobile

React Native app for iOS and Android, built with Expo.

This app is product-only: signed-out users see native Clerk auth, and signed-in
users go straight to the dashboard, library, search, and settings.

## Local Setup

```bash
cp .env.example .env.local
npm run ios
```

Required env vars:

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_API_BASE_URL`

The mobile app calls the existing Next.js backend and never connects directly to
the production database.
