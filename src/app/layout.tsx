import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AVM - Vehicle Management",
  description: "Vehicle and task management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
