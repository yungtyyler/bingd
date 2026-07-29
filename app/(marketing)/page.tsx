import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Tv, Sparkles, Users, Bell } from "lucide-react";
import StructuredData from "@/components/StructuredData";
import { absoluteUrl, DEFAULT_SEO_DESCRIPTION, SITE_NAME } from "@/lib/seo";

const HomePage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${absoluteUrl()}#organization`,
        name: SITE_NAME,
        url: absoluteUrl(),
        logo: absoluteUrl("/icons/icon-512.png"),
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "tyler.varzeas@gmail.com",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl()}#website`,
        name: SITE_NAME,
        url: absoluteUrl(),
        description: DEFAULT_SEO_DESCRIPTION,
        publisher: {
          "@id": `${absoluteUrl()}#organization`,
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${absoluteUrl()}#app`,
        name: SITE_NAME,
        applicationCategory: "EntertainmentApplication",
        operatingSystem: "iOS, Android, Web",
        url: absoluteUrl(),
        description: DEFAULT_SEO_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <StructuredData data={structuredData} />
      {/* 1. Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-8 mt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium border border-brand-primary/20 mb-4">
          <Sparkles className="w-4 h-4" />
          <span>The ultimate TV tracking companion</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
          Stop asking, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-emerald-400">
            &quot;What episode was I on?&quot;
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Track what you&apos;re watching, discover where to stream it, and
          share your personalized library with friends. Welcome to the new home
          for your TV life.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <SignUpButton mode="modal">
            <button className="cursor-pointer w-full sm:w-auto px-8 py-4 text-base font-bold text-black bg-brand-primary rounded-full hover:bg-brand-primary-hover hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]">
              Get Started for Free
            </button>
          </SignUpButton>

          <SignInButton mode="modal">
            <button className="cursor-pointer w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-surface-border rounded-full hover:bg-gray-800 transition-all">
              Sign In
            </button>
          </SignInButton>
        </div>
      </section>

      {/* 2. Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-32 w-full">
        <FeatureCard
          icon={<Tv className="w-6 h-6 text-brand-primary" />}
          title="Track Everything"
          description="Build your library. Log what you're watching, what you've finished, and what's next on your list."
        />
        <FeatureCard
          icon={<Bell className="w-6 h-6 text-brand-primary" />}
          title="Never Miss an Episode"
          description="Get notified when new episodes drop and instantly know which streaming platform to find them on."
        />
        <FeatureCard
          icon={<Users className="w-6 h-6 text-brand-primary" />}
          title="Connect with Friends"
          description="See what your friends are binging, share recommendations, and compare your watch stats."
        />
      </section>
    </div>
  );
};

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-start p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-brand-primary/50 transition-colors group">
      <div className="p-3 rounded-lg bg-black border border-surface-border mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

export default HomePage;
