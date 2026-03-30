import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fold-Space Engine — Phase V",
  description: "A constrained simulation framework for fold-space concepts under explicit field, geometry, and measurement assumptions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#05060a" }}>{children}</body>
    </html>
  );
}
