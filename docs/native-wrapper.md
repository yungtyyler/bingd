# Native Wrapper

bingd uses Capacitor as the first native wrapper path for TestFlight and Google Play testing.

## App Identity

- App name: `bingd`
- Bundle/package id: `com.getbingd.app`
- Production web origin: `https://getbingd.com`

The Capacitor config points the native app at the production web app. This is intentional for the first TestFlight pass because bingd relies on server-rendered Next.js routes, Clerk auth, Prisma-backed APIs, cron jobs, and production Web Push state.

## Local Setup

Install native tooling:

- Xcode from the Mac App Store for iOS.
- Android Studio for Android.
- Apple Developer account for TestFlight signing and App Store Connect.

Then create the native projects:

```bash
npm run cap:add:ios
npm run cap:add:android
```

After native projects exist, sync Capacitor changes:

```bash
npm run cap:sync
```

Open the projects:

```bash
npm run cap:open:ios
npm run cap:open:android
```

## TestFlight Notes

- Use the same bundle id, `com.getbingd.app`, when creating the App Store Connect app record.
- Configure signing in Xcode with the Apple Developer team.
- Verify login, username onboarding, push opt-in, show links, account deletion, and notification deep links on a physical iPhone.
- Native APNs/FCM push support is still a separate launch item. The first wrapper keeps the existing production web push flow intact for installed PWAs.

