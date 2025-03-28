import type { Metadata } from "next";
import "./globals.css";
import { headers } from "next/headers";
import Web3Provider from "~/lib/middleware/Web3Provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = (await headers()).get("cookie");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dark text-foreground bg-background min-h-screen antialiased">
        <Web3Provider cookies={cookies}>{children}</Web3Provider>
        <Toaster />
      </body>
    </html>
  );
}
