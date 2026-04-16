import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google"; // CHANGED: Added Lora
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // CHANGED: Standardized variable name
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora", // CHANGED: Added Lora font
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: "HASSAAN AI ARCHITECT",
  description: "A world-class editorial task manager for the modern scholar.",
  icons: { icon: "/favicon.ico" },
};

import { ActionDock } from "@/components/ActionDock";
import { SnowOverlay } from "@/components/SnowOverlay";
import { LanguageProvider } from "@/context/LanguageContext";
import { EcosystemNav } from "@/components/EcosystemNav";
import { CompanionProvider } from "@/components/companion/CompanionContext";
import { CompanionShell } from "@/components/companion/CompanionShell";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <LanguageProvider>
      <html lang="en" suppressHydrationWarning className={`${inter.variable} ${lora.variable}`}>
        <body className="font-inter antialiased bg-bg-base text-text-primary min-h-screen">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <CompanionProvider>
              {children}
              <ActionDock />
              <SnowOverlay />
              <EcosystemNav />
              <CompanionShell
                platform="H2"
                context="TaskFlow task manager. Your task stack is optimized. Syncing with the global learning protocol."
              />
            </CompanionProvider>
            <Toaster
              richColors 
              position="top-right" 
              closeButton 
              toastOptions={{
                className: 'border-fine shadow-card font-inter text-[13px]',
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </LanguageProvider>
  );
}


