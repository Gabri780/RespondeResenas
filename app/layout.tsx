import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RespondePro — Responde a reseñas de Google con IA",
  description: "Genera respuestas profesionales para las reseñas de Google de tu negocio. Con IA, en español, en 30 segundos. Para bares, restaurantes, hoteles y más.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground uppercase-none">
        {children}
      </body>
    </html>
  );
}
