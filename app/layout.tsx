import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agendamed",
  description: "Agenda de consultas médicas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
