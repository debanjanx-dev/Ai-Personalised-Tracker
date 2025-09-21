import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "./components/Navbar";
import { HeroUIProvider } from "@heroui/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InSightsAI",
  description: "InSightsAI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <Navbar />
          <HeroUIProvider>
            <main>
              {children}
            </main>
          </HeroUIProvider>
        </ClerkProvider>
        <footer className="py-8 px-4 bg-black">
          <div className="text-center bf">
            <p className="text-gray-400">
              Made with{" "}
              <span className="text-red-500 animate-pulse">❤</span>
              {" "}by{" "}
              <span className="text-blue-400 font-medium">Debanjan Mukherjee</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}