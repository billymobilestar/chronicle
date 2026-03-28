import type { Metadata } from "next";
import localFont from "next/font/local";
import { Syne, Space_Grotesk } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["300", "400", "500", "600", "700"],
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Chronicle Records",
    template: "%s | Chronicle Records",
  },
  description:
    "Discover new music, connect with artists, and be part of the story. Chronicle Records fan portal.",
  openGraph: {
    title: "Chronicle Records",
    description: "Discover new music, connect with artists, and be part of the story.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${spaceGrotesk.variable} ${geistSans.variable} antialiased font-body`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
