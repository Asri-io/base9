import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BASE9 — Custom Clothing",
  description:
    "Premium custom clothing. Your vision, our craft. T-shirts, hoodies, jackets — made for you.",
  keywords: ["custom clothing", "base9", "print on demand", "custom shirts", "streetwear"],
  openGraph: {
    title: "BASE9 — Custom Clothing",
    description: "Premium custom clothing. Your vision, our craft.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain">{children}</body>
    </html>
  );
}
