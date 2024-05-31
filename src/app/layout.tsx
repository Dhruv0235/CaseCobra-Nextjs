import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Providers from "@/components/ui/Providers";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Recursive } from "next/font/google";
import "./globals.css";
import { constructMetadata } from "@/lib/utils";

const inter = Recursive({ subsets: ["latin"] });

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="flex flex-col min-h-[calc(100vh-3.5rem-1px)] grainy-light">
          <div className="flex flex-1 flex-col h-full">
            <Providers>{children}</Providers>
          </div>
          <Footer />
        </main>
        <Toaster />
      </body>
    </html>
  );
}
