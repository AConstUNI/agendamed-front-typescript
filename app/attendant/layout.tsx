"use client";

import AppBarLayout from "../.components/AppBarLayout"

const menuItems = [
  { text: "Home", href: "/attendant" },
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
