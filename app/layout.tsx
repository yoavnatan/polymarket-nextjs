import type { Metadata } from "next";
import "../styles/main.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Polymarket",
  description: "Prediction Markets Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}