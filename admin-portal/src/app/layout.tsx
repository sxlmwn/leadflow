import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadFlow Admin Portal",
  description: "Enterprise Lead Management & Distribution Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground selection:bg-foreground selection:text-background">
        {children}
      </body>
    </html>
  );
}
