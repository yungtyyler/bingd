# Launch Checklist

Use this as the short path from production web beta to TestFlight and store review.

## Production Web Beta

- Canonical domain is `https://getbingd.com`.
- Vercel production environment variables are set:
  - `DATABASE_URL`
  - `DIRECT_URL`
  - `BASE_ADDRESS=https://getbingd.com`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `CRON_SECRET`
  - `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`
  - `WEB_PUSH_PRIVATE_KEY`
  - `WEB_PUSH_CONTACT`
- Clerk is using a production instance with `https://getbingd.com` allowed for app URLs, redirects, and OAuth callbacks.
- Neon production backups and restore windows are enabled.
- `npm run smoke:production` passes against `https://getbingd.com`.
- Public SEO metadata, social share image, robots, sitemap, and structured data are live.
- Google Search Console verification is configured through DNS or `GOOGLE_SITE_VERIFICATION`.
- `https://getbingd.com/sitemap.xml` is submitted in Google Search Console.
- Account deletion, privacy policy, terms, support contact, install flow, and push opt-in are available from production.

## TestFlight Prep

- Create the Apple Developer account and App Store Connect app record.
- Choose the native wrapper approach, likely Capacitor around the deployed app.
- Add native app icons, splash screens, bundle id, app display name, and signing.
- Implement native push provider support for APNs and FCM without replacing the existing web push flow.
- Add native handling for notification deep links back into show, library, or settings screens.
- Build and upload the first internal TestFlight build.

## Store Readiness

- Prepare screenshots for iPhone, iPad if supported, and Android.
- Finalize app description, keywords, support URL, marketing URL, privacy URL, and category.
- Complete Apple privacy nutrition labels and Google Play data safety form.
- Run a small beta with real users and verify notifications, account deletion, onboarding, and search.
- Decide which premium features ship in the first paid release.
