// src/components/theme-provider.tsx
"use client";

import * as React from "react";

// Minimal passthrough ThemeProvider (no dark-mode lib required)
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
