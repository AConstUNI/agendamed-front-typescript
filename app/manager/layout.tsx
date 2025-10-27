"use client";

import AppBarLayout from "../.components/AppBarLayout";

const menuItems = [
  { text: "Home", href: "/manager" },
  { text: "Gerenciamento de Funcionários", href: "/manager/employees" },
  { text: "Registro", href: "/manager/log" },
];

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppBarLayout menuItems={menuItems} role="admin">
      {children}
    </AppBarLayout>
  );
}
