import type { Metadata } from "next";
import type { Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SITE_URL, SITE_URL_OBJECT } from "@/lib/site-url";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: SITE_URL_OBJECT,
  applicationName: "bingd.",
  title: {
    template: "%s | bingd.",
    default: "bingd. | The ultimate TV tracking companion",
  },
  description:
    "Stop asking 'What episode was I on?'. Track what you're watching, discover where to stream it, and never lose your place again.",
  openGraph: {
    title: "bingd.",
    description: "The ultimate TV tracking companion.",
    url: SITE_URL,
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
  appleWebApp: {
    capable: true,
    title: "bingd.",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
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
          <ServiceWorkerRegistration />
          <Toaster position="bottom-right" richColors />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
