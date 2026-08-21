import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IKS Corporate Customer 360 & Visit App",
  description: "ระบบข้อมูลลูกค้านิติบุคคล การเข้าเยี่ยม และประวัติรถ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
