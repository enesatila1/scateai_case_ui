import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scate AI - Music Generation",
  description: "Generate original songs and AI voice covers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {children}
      </body>
    </html>
  );
}
