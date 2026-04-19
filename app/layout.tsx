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
  title: "OpenTask — Panaversity",
  description: "A world-class editorial task manager for the modern scholar.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${lora.variable}`}>
      <body className="font-inter antialiased bg-bg-base text-text-primary min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="light" // CHANGED: Switched to light mode
          forcedTheme="light"  // CHANGED: Forced light mode for humanist aesthetic
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
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
  );
}

