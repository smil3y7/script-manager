import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skriptarna",
  description: "Centralna zbirka avtomatizacijskih skript",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sl">
      <body>{children}</body>
    </html>
  );
}
