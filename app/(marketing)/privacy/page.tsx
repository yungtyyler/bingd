import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How bingd collects, uses, and protects your personal information.",
};

const PrivacyPage = () => {
  return (
    <div className="max-w-3xl mx-auto py-24 px-6 md:px-12">
      <h1 className="text-3xl font-extrabold text-white mb-8 tracking-tight">
        Privacy Policy
      </h1>
      <div className="space-y-6 text-gray-400 leading-relaxed text-sm">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
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

        <h2 className="text-xl font-bold text-white mt-8 mb-4">
          2. How We Use Your Information
        </h2>
        <p>
          We use your information exclusively to provide, maintain, and improve
          the bingd service. We do not sell your personal data or your watch
          history to third-party advertisers.
        </p>

        {/* Add more standard privacy clauses as needed */}
        <p className="pt-8 text-xs text-gray-500 italic">
          Note: This is a placeholder Privacy Policy for the beta launch.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;
