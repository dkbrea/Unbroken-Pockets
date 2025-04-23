import type { Metadata } from "next";
import { Inter, Fira_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import ClientLayout from "@/components/layout/ClientLayout";

// Inter works without specifying weight (defaults to 400)
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Fira_Mono REQUIRES weight
const firaMono = Fira_Mono({
  variable: "--font-mono",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unbroken Pockets | Personal Finance Analytics Platform",
  description: "Take control of your finances with Unbroken Pockets - Your home base for money clarity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${firaMono.variable} antialiased bg-[#FDF6EC] min-h-screen w-full`}
      >
        <div className="flex w-full">
          <Sidebar />
          <div className="flex flex-col w-full">
              <ClientLayout>{children}</ClientLayout>
          </div>
        </div>
      </body>
    </html>
  );
}
