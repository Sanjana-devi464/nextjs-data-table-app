import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/providers/ReduxProvider";
import ThemeProvider from "@/providers/ThemeProvider";
import EmotionProvider from "@/providers/EmotionProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Dynamic Data Table Manager",
  description: "A powerful data table manager with advanced features built with Next.js, Redux Toolkit, and Material UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ReduxProvider>
          <EmotionProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </EmotionProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
