import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "./_components/SessionProvider";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
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
      <body className={`${roboto.variable} antialiased`}>
        <Providers> {children}</Providers>
      </body>
    </html>
  );
}
