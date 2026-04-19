import type { Metadata } from "next";
import "../styles/main.css";
import Providers from "@/components/providers";


export const metadata: Metadata = {
  title: "Polymarket",
  description: "Prediction Markets Platform",
};

// app/layout.tsx (Server Component)

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