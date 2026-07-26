import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using the bingd service.",
};

const TermsPage = () => {
  return (
    <div className="max-w-3xl mx-auto py-24 px-6 md:px-12">
      <h1 className="text-3xl font-extrabold text-white mb-8 tracking-tight">
        Terms of Service
      </h1>

      <div className="space-y-6 text-gray-400 leading-relaxed text-sm">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          Welcome to bingd. By accessing or using our website and services, you
          agree to be bound by these Terms of Service.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">
          1. Description of Service
        </h2>
        <p>
          bingd is a personal TV show tracking application. We utilize
          third-party APIs (such as TVMaze) to provide show metadata, cover art,
          and episode information.{" "}
          <strong>
            bingd does not host, stream, or distribute any video content.
          </strong>
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">
          2. User Accounts
        </h2>
        <p>
          You are responsible for safeguarding the credentials you use to access
          bingd. We reserve the right to suspend or terminate accounts that
          violate these terms, attempt to reverse-engineer the service, or
          engage in abusive behavior.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">
          3. Data & API Usage
        </h2>
        <p>
          Show data and images are provided &quot;as is&quot; by third-party
          services. bingd makes no guarantees regarding the accuracy,
          completeness, or continuous availability of this metadata. You agree
          not to use automated scripts or bots to scrape data from the bingd
          platform.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">
          4. Changes to Service
        </h2>
        <p>
          We are constantly improving bingd. We may add or remove features, and
          we may suspend or stop a service altogether without prior notice
          during this beta period.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">
          5. Notifications
        </h2>
        <p>
          If you enable push notifications, bingd may send alerts about shows
          in your library, including upcoming episodes and new seasons.
          Notification timing depends on third-party metadata, device settings,
          browser support, and operating system delivery behavior.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">
          6. Account Deletion
        </h2>
        <p>
          You may delete your account from Settings. Account deletion removes
          your bingd account data from the active application database and
          deletes your authentication account.
        </p>

        <p className="pt-8 text-xs text-gray-500 italic">
          Note: These terms should be reviewed before a full public launch.
        </p>
      </div>
    </div>
  );
};

export default TermsPage;
