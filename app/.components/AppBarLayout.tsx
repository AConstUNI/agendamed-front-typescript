"use client";

import Link from "next/link";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { getUserSession } from "../.lib/auth";
import { useEffect, useState } from "react";

export default function AppBarLayout({
  children, menuItems, role
}: {
  children: React.ReactNode;
  menuItems: Array<{ text: string, href: string }>
  role: string
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // to prevent flicker

  useEffect(() => {
    async function verifyAccess() {
      const token = sessionStorage.getItem("jwtToken");

      if (!token) {
        router.replace("/");
        return;
      }

      const user = await getUserSession(token);
      if (!user || (user.role !== role)) {
        router.replace("/"); // redirect if no access
        return;
      }

      setLoading(false);
    }

    verifyAccess();
  }, [router, role]);

  if (loading) return <center style={{marginTop: "50vh"}}><CircularProgress /></center>; // show nothing until access verified

  return (
    <Box sx={{ display: "flex" }}>
      {/* AppBar */}
      <AppBar position="fixed" component="nav">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          >
            AgendaMed
          </Typography>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {menuItems.map((item) => (
              <Link
                key={item.text}
                href={item.href}
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  marginRight: "20px",
                }}
              >
                {item.text}
              </Link>
            ))}
            <Button color="error" variant="contained" href="/access/login">Sair</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
