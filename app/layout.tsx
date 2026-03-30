import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fold-Space Engine",
  description: "A constrained future-comparison and fold-space simulation interface with decision, intent, navigation, and research modes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#05060a" }}>{children}</body>
    </html>
  );
}
