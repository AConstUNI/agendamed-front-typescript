'use client'

import { Alert, Box, Button, Card, Collapse, FormControl, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [helperTexts, setHelperTexts] = useState({ email: "", password: "" });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("Erro");

  useEffect(() => {
    sessionStorage.removeItem("jwtToken")
  }, []);

  const validateEmail = (email: string) => {
    if (!email) return "Insira um email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email inválido";
    return "";
  };

  const everythingRight = () => {
    let tempHelpers = { email: "", password: "" };

    tempHelpers.email = validateEmail(email);
    if (!password) tempHelpers.password = "Insira uma senha";

    setHelperTexts(tempHelpers);

    return tempHelpers.email === "" && tempHelpers.password === "";
  };

  const handleLoginSubmit = async () => {
    if (!process.env.NEXT_PUBLIC_API_LINK) throw "API link not found";

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setAlertOpen(true);
        setAlertMessage("Credenciais inválidas ou erro no servidor");
        return;
      }

      const data = await response.json();
      sessionStorage.setItem("jwtToken", data.access_token);
      router.push('/');
    } catch (e) {
      console.log(e);
      setAlertOpen(true);
      setAlertMessage("Erro ao enviar as informações para a API");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: "linear-gradient(135deg, #5a91f8 0%, #344eb5 100%)",
        p: 2
      }}
    >
      <Card
        sx={{
          p: { xs: 3, sm: 5 },
          width: "100%",
          maxWidth: 400,
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          backgroundColor: "rgba(255,255,255,0.95)",
          transition: "transform 0.3s",
          "&:hover": {
            transform: "scale(1.02)"
          }
        }}
      >
        <Typography
          variant="h4"
          textAlign="center"
          mb={3}
          fontWeight={700}
          color="primary"
        >
          Bem-vindo
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          mb={4}
          color="text.secondary"
        >
          Faça login para agendar suas consultas médicas
        </Typography>

        <Collapse in={alertOpen}>
          <Alert
            action={
              <Button aria-label="close" size="small" onClick={() => setAlertOpen(false)}>Fechar</Button>
            }
            severity="error"
            sx={{ mb: 2 }}
          >
            {alertMessage}
          </Alert>
        </Collapse>

        <FormControl fullWidth>
          <TextField
            label="Email"
            variant="outlined"
            margin="normal"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setHelperTexts({ ...helperTexts, email: "" }); }}
            helperText={helperTexts.email}
            error={helperTexts.email !== ""}
            fullWidth
          />
          <TextField
            label="Senha"
            type="password"
            variant="outlined"
            margin="normal"
            autoComplete="current-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setHelperTexts({ ...helperTexts, password: "" }); }}
            helperText={helperTexts.password}
            error={helperTexts.password !== ""}
            fullWidth
          />

          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              variant="contained"
              onClick={() => { if (everythingRight()) handleLoginSubmit(); }}
              sx={{
                py: 1.5,
                fontWeight: 600,
                px: 4,
                backgroundColor: "#5a91f8",
                color: "#fff",
                "&:hover": { backgroundColor: "#3b6fd1" },
                borderRadius: 2,
              }}
              fullWidth
            >
              Entrar
            </Button>
          </Box>
        </FormControl>
      </Card>
    </Box>
  );
}
