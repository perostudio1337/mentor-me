import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ChatWidget from '@/components/ChatWidget';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mentor.me — Find Your Mentor",
  description:
    "Connect with experienced mentors who can help you turn your startup idea into reality. A platform by E³UDRES².",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}