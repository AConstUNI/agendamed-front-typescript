"use client";

import Link from "next/link";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Divider,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { getUserSession } from "../.lib/auth";
import { useEffect, useState } from "react";

export default function AppBarLayout({
  children,
  menuItems,
  role,
}: {
  children: React.ReactNode;
  menuItems: Array<{ text: string; href: string }>;
  role: string;
}) {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    async function verifyAccess() {
      const token = sessionStorage.getItem("jwtToken");
      if (!token) {
        router.replace("/");
        return;
      }

      const user = await getUserSession(token);
      if (!user || user.role !== role) {
        router.replace("/");
        return;
      }

      setLoading(false);
    }

    verifyAccess();
  }, [router, role]);

  const handleLogout = () => {
    sessionStorage.removeItem("jwtToken");
    router.replace("/access/login");
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* AppBar */}
      <AppBar position="fixed" color="primary" component="nav" elevation={2}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Left side: Menu (mobile) + App name */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Button
              color="inherit"
              variant="outlined"
              sx={{ display: { sm: "none" } }}
              onClick={() => setDrawerOpen(true)}
            >
              Menu
            </Button>

            <Typography
              variant="h6"
              sx={{ fontWeight: 600, letterSpacing: 1, cursor: "pointer" }}
              onClick={() => router.push("/")}
            >
              AgendaMed
            </Typography>
          </Box>

          {/* Right side: Desktop Menu + Logout */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 2 }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                href={item.href}
                color="inherit"
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                {item.text}
              </Button>
            ))}

            {/* Logout Button */}
            <Button
              color="inherit"
              variant="outlined"
              onClick={handleLogout}
              sx={{
                borderColor: "rgba(255,255,255,0.6)",
                color: "#fff",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 2,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "red",
                  borderColor: "red",
                  color: "#fff",
                  transform: "scale(1.03)",
                },
              }}
            >
              Sair
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: 250, paddingY: 2 } } }}
      >
        <Box sx={{ px: 2, mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            AgendaMed
          </Typography>
          <Divider sx={{ my: 1 }} />
        

        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}

        </List>
          {/* Logout button inside drawer */}
          <Divider sx={{ my: 1 }} />
          
            <Button
              onClick={() => {
                setDrawerOpen(false);
                handleLogout();
              }}
              sx={{
                color: "error.main",
                "&:hover": {
                  backgroundColor: "rgba(255,0,0,0.08)",
                },
              }}
            >
              Sair
            </Button>
        </Box>
      </Drawer>

      {/* Spacer to offset AppBar */}
      <Toolbar />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          backgroundColor: theme.palette.background.default,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
