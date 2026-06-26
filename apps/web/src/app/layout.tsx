import "./globals.css";

import type { Metadata, Viewport } from "next";

import { PwaRegister } from "@/components/app/PwaRegister";
import { Quicksand } from "next/font/google";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: {
    default: "Suparsale Store",
    template: "%s | Suparsale Store",
  },
  description: "Business control system for Suparsale Store.",
  manifest: "/manifest.webmanifest",
  applicationName: "Suparsale Store",
  appleWebApp: {
    capable: true,
    title: "Suparsale Store",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#006CFD",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={quicksand.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('erc-theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              } catch(e) {}
            `,
          }}
        />
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}




