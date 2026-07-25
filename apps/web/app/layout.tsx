import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURA — AI-powered clothing store",
  description:
    "Shop clothing with an AI styling assistant, visual search, smart recommendations and fit prediction.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
