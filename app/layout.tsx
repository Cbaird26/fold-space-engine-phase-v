import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fold-Space Engine",
  description: "A constrained fold-space simulation demo for field geometry, path selection, and visibility mapping.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#05060a" }}>{children}</body>
    </html>
  );
}
