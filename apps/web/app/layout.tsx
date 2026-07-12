import "./globals.css";
import { Inter, Geist } from "next/font/google";
import { Providers } from "../components/providers";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: "Crime Hotspot MVP",
  description: "Cross River State Crime Hotspot Analysis System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, "dark")}>
      <body className="bg-background text-foreground antialiased selection:bg-indigo-500/30">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
