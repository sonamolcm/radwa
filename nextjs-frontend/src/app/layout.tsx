import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radwa ERP - CRM Inbound Tender Intake & Work Orders",
  description: "Enterprise Inbound Tender Intake, Client Registration, Estimator Allocation, and 40-Doc Bid Dossier Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
