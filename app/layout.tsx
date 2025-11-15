import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar } from "@/components/sidebar";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "API Gateway Dashboard",
  description: "High-performance API Gateway and Rate Limiter with Clerk Auth",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={inter.className}>
          <Providers>
            <div className="flex h-screen bg-gray-950">
              <Sidebar />
              <main className="flex-1 overflow-auto bg-gray-950">
                {children}
              </main>
            </div>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
