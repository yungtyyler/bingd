import { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "About",
  path: "/about",
  description:
    "The story behind bingd and why we built the ultimate TV tracking companion.",
});

const AboutPage = () => {
  return (
    <div className="max-w-3xl mx-auto py-24 px-6 md:px-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tight">
        The story behind <span className="text-brand-primary">bingd.</span>
      </h1>

      <div className="space-y-6 text-lg text-gray-400 leading-relaxed">
        <p>
          It always started with the same frustrating question:{" "}
          <em>&quot;Wait, did we already watch this episode?&quot;</em>
        </p>
        <p>
          Hi, I&apos;m Tyler. Like a lot of people, my wife Marissa and I bounce
          between half a dozen streaming services. Keeping track of what show is
          on what platform, when new seasons drop, and exactly which episode we
          left off on became a massive headache. We spent more time trying to
          find our place than actually watching TV.
        </p>
        <p>
          I couldn&apos;t find a tracking app that felt modern, fast, and
          didn&apos;t require a master&apos;s degree to navigate. So, I built
          bingd.
        </p>
        <p>
          bingd is designed to be the ultimate companion for your TV life.
          It&apos;s built to be blazing fast, visually cinematic, and incredibly
          simple to use. No clutter, just your shows.
        </p>
        <p className="pt-4 font-medium text-white">
          Happy watching, <br />— Tyler
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
