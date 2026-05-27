"use client";

import "./globals.css";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <title>VPDF ERP</title>
        <meta name="description" content="ERP VentesPleinDeFoin" />
      </head>
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-60 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}