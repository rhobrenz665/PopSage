import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/source-serif-4/latin-400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "PopSage — Support that knows its limits",
  description:
    "Grounded AI customer support with live conversations and seamless human handoff.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
