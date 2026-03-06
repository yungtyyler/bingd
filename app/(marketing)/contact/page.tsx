import { Mail } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the bingd team for support, feature requests, or just to talk TV.",
};

const ContactPage = () => {
  return (
    <div className="max-w-3xl mx-auto py-24 px-6 md:px-12 text-center mt-10">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
        Get in touch
      </h1>
      <p className="text-lg text-gray-400 mb-12 max-w-xl mx-auto">
        Have a feature request, found a bug, or just want to talk about your
        favorite show? I&apos;d love to hear from you.
      </p>

      <a
        href="mailto:tyler.varzeas@gmail.com"
        className="inline-flex items-center gap-3 px-8 py-4 text-base font-bold text-black bg-brand-primary rounded-full hover:bg-brand-primary-hover hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
      >
        <Mail className="w-5 h-5" />
        Email Support
      </a>
    </div>
  );
};

export default ContactPage;
