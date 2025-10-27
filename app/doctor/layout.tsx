"use client";

import AppBarLayout from "../.components/AppBarLayout";

const menuItems = [
  { text: "Home", href: "/doctor" },
];

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppBarLayout menuItems={menuItems} role="doctor">
      {children}
    </AppBarLayout>
  );
}
