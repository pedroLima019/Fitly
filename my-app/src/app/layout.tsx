import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./_components/SessionProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: "100",
});

export const metadata: Metadata = {
  title: "Fitly",
  description:
    "Aplicativo de gerenciamento de treinos para personal e clientess, com recursos de criação de treinos, acompanhamento de progresso e comunicação integrada.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${poppins.variable} antialiased`}>
        <Providers> {children}</Providers>
      </body>
    </html>
  );
}
