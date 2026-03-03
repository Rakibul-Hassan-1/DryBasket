import type { Metadata } from "next";
import { Geist_Mono, Playfair_Display } from "next/font/google";
import AnalyticsProvider from "../src/components/AnalyticsProvider";
import SiteNav from "../src/components/SiteNav";
import { AuthProvider } from "../src/contexts/AuthContext";
import { CartProvider } from "../src/contexts/CartContext";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DryBasket | Food E-commerce",
  description:
    "Professional dry food e-commerce with Firebase auth, cart and orders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${playfairDisplay.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <AnalyticsProvider />
            <SiteNav />
            <main className="min-h-[calc(100vh-68px)] bg-gray-50">
              {children}
            </main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
