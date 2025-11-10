"use client";

import AppBarLayout from "../.components/AppBarLayout"

const menuItems = [
  { text: "Agendamento", href: "/attendant/scheduling" },
  { text: "Cadastro de Cliente", href: "/attendant/customer" },
];

export default function AttendantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppBarLayout menuItems={menuItems} role="atendent">
      {children}
    </AppBarLayout>
  );
}
