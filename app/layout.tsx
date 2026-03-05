import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_ADDRESS = process.env.BASE_ADDRESS;

export const metadata: Metadata = {
  title: {
    template: "%s | bingd.",
    default: "bingd. | The ultimate TV tracking companion",
  },
  description:
    "Stop asking 'What episode was I on?'. Track what you're watching, discover where to stream it, and never lose your place again.",
  openGraph: {
    title: "bingd.",
    description: "The ultimate TV tracking companion.",
    url: `${BASE_ADDRESS}`,
    siteName: "bingd.",
    images: [
      {
        url: "/green_bingd_logo.png",
        width: 1200,
        height: 630,
        alt: "bingd. Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "bingd.",
    description: "The ultimate TV tracking companion.",
    images: ["/green_bingd_logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Toaster position="bottom-right" richColors />
          {children}
          <footer className="mt-auto pt-32 pb-8 text-center text-gray-600 text-sm">
            <p>© {new Date().getFullYear()} bingd. All rights reserved.</p>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
