import Link from "next/link";

const Footer = () => {
  return (
    <footer className="mx-auto pt-32 pb-8 w-full border-t border-surface-border mt-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-600 text-sm">
          © {new Date().getFullYear()} bingd. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm font-medium text-gray-500">
          <Link
            href="/about"
            className="hover:text-brand-primary transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="hover:text-brand-primary transition-colors"
          >
            Contact
          </Link>
          <Link
            href="/privacy"
            className="hover:text-brand-primary transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="hover:text-brand-primary transition-colors"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
