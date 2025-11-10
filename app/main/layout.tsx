"use client";

import AppBarLayout from "../.components/AppBarLayout"; 

const menuItems = [
  { text: "Agendamentos", href: "/main" },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppBarLayout menuItems={menuItems} role="user">
      {children}
    </AppBarLayout>
  );
}
