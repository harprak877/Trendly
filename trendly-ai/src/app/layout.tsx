import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Trendly.ai - AI-Powered Social Media Content Generator",
  description: "Generate trending TikTok content ideas, captions, and hashtags with AI. Perfect for social media managers, creators, and influencers.",
  keywords: "AI, social media, TikTok, content generation, hashtags, captions, trends",
  authors: [{ name: "Trendly.ai" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="font-sans antialiased bg-secondary-50 text-secondary-900">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

