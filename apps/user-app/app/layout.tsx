
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "../provider";
import { AppbarClient } from "../components/AppbarClient";
import AppProviders from "../components/AppProviders";
import { SidebarProvider } from "../components/SidebarContext"; // 👈 ADD

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wallet",
  description: "Simple wallet app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-x-hidden`}
      >
        <Providers>
          <AppProviders>
            <SidebarProvider> {/* 👈 MOVE HERE */}
              <div className="min-h-screen flex flex-col">
                <AppbarClient />
                <div className="flex-1">{children}</div>
              </div>
            </SidebarProvider>
          </AppProviders>
        </Providers>
      </body>
    </html>
  );
}