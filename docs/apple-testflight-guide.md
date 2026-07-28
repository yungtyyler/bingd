# Apple TestFlight Guide

Use this once the Apple Developer Program enrollment changes from pending to active.

## What Is Blocked While Enrollment Is Pending

You can keep writing and testing app code, but these production Apple steps usually require an active paid developer team:

- Register the production bundle ID `com.getbingd.app`.
- Enable the Push Notifications capability for that bundle ID.
- Create an App Store Connect app record.
- Generate APNs auth keys.
- Sign, archive, upload, and distribute a TestFlight build.

## Recommended Apple Setup Order

1. Sign in to Apple Developer with the account that owns the subscription.
2. Accept any pending agreements in Apple Developer and App Store Connect.
3. Register an explicit App ID / Bundle ID:
   - Description: `bingd`
   - Bundle ID: `com.getbingd.app`
   - Capabilities: Push Notifications
4. Create an APNs auth key:
   - Capability: Apple Push Notifications service
   - Save the `.p8` file immediately. Apple only lets you download it once.
   - Record the Key ID.
5. Record the Team ID from Apple Developer account membership details.
6. Open Xcode:
   - Project: `ios/App/App.xcodeproj`
   - Target: `App`
   - Signing & Capabilities
   - Select your Team.
   - Keep Automatically manage signing enabled.
   - Confirm Bundle Identifier is `com.getbingd.app`.
   - Add Push Notifications capability if Xcode did not add it automatically.
7. In App Store Connect, create a new app:
   - Platform: iOS
   - Name: `bingd`
   - Primary language: English (U.S.)
   - Bundle ID: `com.getbingd.app`
   - SKU: `bingd-ios`
   - User access: Full Access
8. Add APNs env vars to Vercel production:
   - `APNS_KEY_ID`: Apple key ID
   - `APNS_TEAM_ID`: Apple team ID
   - `APNS_PRIVATE_KEY`: full `.p8` private key content
   - `APNS_BUNDLE_ID`: `com.getbingd.app`
   - `APNS_ENVIRONMENT`: `production`
9. Run a production smoke test.
10. In Xcode, archive and upload the first build to App Store Connect.
11. In App Store Connect, add yourself as an internal TestFlight tester and install the build.

## Important Notes

- The bundle ID is hard to change after the first uploaded build, so keep `com.getbingd.app`.
- TestFlight builds use production-style signing and should use the production APNs environment.
- The native app currently wraps `https://getbingd.com`, so production web deployment needs to be healthy before each native build.
- Web push and APNs push are separate delivery systems. The app now supports both, but Apple credentials are still required before APNs can actually deliver.
