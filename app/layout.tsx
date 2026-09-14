import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Analytics } from "@/components/analytics";

const spaceGroteskHeading = Space_Grotesk({subsets:['latin'],variable:'--font-heading'});

const dmSans = DM_Sans({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dmgly — Design your DMG",
  description: "Create a beautiful macOS installer. Customize your DMG background and layout, then export configs and AI setup prompts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", dmSans.variable, spaceGroteskHeading.variable)}
    >
      <body className="min-h-full flex flex-col">
        <Analytics />
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
