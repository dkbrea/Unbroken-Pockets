import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import ClientLayout from "@/components/layout/ClientLayout";

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
        className="font-sans antialiased bg-[#FDF6EC] min-h-screen w-full"
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
