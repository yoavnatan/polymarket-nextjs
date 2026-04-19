import type { Metadata } from "next";
import "../styles/main.css";

export const metadata: Metadata = {
  title: "Polymarket Clone",
  description: "Prediction Markets Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}