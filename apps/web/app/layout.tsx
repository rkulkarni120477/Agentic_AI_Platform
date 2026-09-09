import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academian Agentic AI Platform",
  description: "Multi-agent content, skills, standards, accessibility, and knowledge workflow platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
