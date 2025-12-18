import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dracin - Chinese Drama Streaming",
  description: "Watch the latest Chinese Dramas with English Subtitles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-black text-gray-100 antialiased`}>
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  );
}
