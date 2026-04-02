import type { Metadata } from "next";
import { Source_Serif_4, DM_Sans } from "next/font/google";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RespondePro — Responde a reseñas de Google con IA",
  description: "Genera respuestas profesionales para las reseñas de Google de tu negocio. Con IA, en español, en 30 segundos. Para bares, restaurantes, hoteles y más.",
  openGraph: {
    title: "RespondePro — Responde a reseñas de Google con IA",
    description: "Genera respuestas profesionales para las reseñas de Google de tu negocio. Con IA, en español, en 30 segundos.",
    images: [{ url: "/logo-og.png" }],
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "RespondePro — Responde a reseñas de Google con IA",
    description: "Genera respuestas profesionales para las reseñas de Google de tu negocio.",
    images: ["/logo-og.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${sourceSerif.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
