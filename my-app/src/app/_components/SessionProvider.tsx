"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import BottomMenu from "./BottomMenu";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <BottomMenu />
    </SessionProvider>
  );
}
