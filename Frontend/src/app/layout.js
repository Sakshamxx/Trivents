import { Inter, Anton } from "next/font/google";
import "./globals.css";
import "./cinematic.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

export const metadata = {
  title: "Trivents — We Capture. We Create. We Connect.",
  description:
    "Trivents is the social media and event creative club of Trinity Institute — building stories, moments, and digital experiences with culture, creativity, and community at the center.",
  keywords: [
    "Trivents",
    "Trinity Institute",
    "social media club",
    "event creative",
    "community",
  ],
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

import LenisProvider from "@/components/LenisProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable}`}>
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
