import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
         className={cn(
          'min-h-screen font-sans antialiased grainy',
          inter.className
        )}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
