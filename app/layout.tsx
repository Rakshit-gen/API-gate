import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "API Gateway Dashboard",
  description: "High-performance API Gateway and Rate Limiter with Clerk Auth",
  icons: {
    icon: "/gate.png",
  },
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
            <LayoutWrapper>{children}</LayoutWrapper>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
