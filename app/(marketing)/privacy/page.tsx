import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How bingd collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "July 26, 2026";

const PrivacyPage = () => {
  return (
    <div className="max-w-3xl mx-auto py-24 px-6 md:px-12">
      <h1 className="text-3xl font-extrabold text-white mb-8 tracking-tight">
        Privacy Policy
      </h1>
      <div className="space-y-6 text-gray-400 leading-relaxed text-sm">
        <p>Last updated: {LAST_UPDATED}</p>
        <p>
          At bingd, we take your privacy seriously. This policy describes how we
          collect, use, and handle your personal information when you use our
          website and services.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">
          1. Information We Collect
        </h2>
        <p>
          When you create an account, we collect basic information such as your
          name, email address, and authentication details provided by your login
          provider (e.g., Google or Apple). We also store data related to the TV
          shows you track to provide our core service.
        </p>
        <p>
          If you enable notifications, we store your notification preferences,
          browser or device push subscription details, delivery attempts, and
          related technical data such as user agent and failure counts. We use
          this data only to deliver and maintain show alerts.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">
          2. How We Use Your Information
        </h2>
        <p>
          We use your information exclusively to provide, maintain, and improve
          the bingd service. We do not sell your personal data or your watch
          history to third-party advertisers.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">
          3. Account Deletion
        </h2>
        <p>
          You can delete your account from Settings. Deleting your account
          removes your bingd profile, watch library, follows, notification
          preferences, push subscriptions, and alert history from our active
          application database. Some records may remain temporarily in backups
          or infrastructure logs until they expire through normal retention
          cycles.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">
          4. Third-Party Services
        </h2>
        <p>
          bingd uses service providers for authentication, hosting, database
          storage, and show metadata. These providers process data as needed to
          operate the service.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;
