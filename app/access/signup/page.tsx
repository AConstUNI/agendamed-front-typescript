'use client'

import { Alert, Box, Button, Card, Checkbox, Collapse, FormControl, FormControlLabel, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Signup() {
  const router = useRouter()
  const helperTextsBase = { name: "", email: "", password: "", confirmPassword: "", termsConfirmation: "" }
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [termsConfirmation, setTermsConfirmation] = useState(false)
  const [helperTexts, setHelperTexts] = useState({...helperTextsBase})
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState("Erro")

  const matchPasswords = (password: string, confirmPassword: string) => {
    if (!password) return "Insira uma senha";
    if (password !== confirmPassword) return "Senhas Diferentes";
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email) return "Insira um email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email Inválido";
    return "";
  };

  const everythingRight = () => {
    let helperTextsTemp = {...helperTextsBase}

    if (!name)
      helperTextsTemp.name = "Insira um nome"

    if (!email)
      helperTextsTemp.email = "Insira um email"

    helperTextsTemp.email = validateEmail(email)

    if (!password)
      helperTextsTemp.password = "Insira uma senha"

    helperTextsTemp.confirmPassword = matchPasswords(password, confirmPassword)

    if (!termsConfirmation)
      helperTextsTemp.termsConfirmation = "Você precisa aceitar os termos para cadastrar"

    setHelperTexts(helperTextsTemp)

    if ((JSON.stringify(helperTextsTemp) === JSON.stringify(helperTextsBase)) && termsConfirmation)
      return true
  }

  const handleSignupSubmit = async () => {
    if (process.env.NEXT_PUBLIC_API_LINK) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, password })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.log(errorData)
          setAlertOpen(true)
          setAlertMessage("Informaçẽos não aceitas na API")
          return;
        }

        const user = await response.json();
      }
      catch (e) {
        console.log(e)
        setAlertOpen(true)
        setAlertMessage("Erro ao enviar as informações para a API")
      }
      finally {
        setName
      }
    }
    else
      throw "API link not found"
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#344eb5ff"
      p={2}
    >
      <Card
        sx={{
          p: { xs: 2, sm: 4 },
          width: '100%',
          maxWidth: 450,
          boxShadow: 3
        }}
      >
        <Button href="/access/login" variant="outlined" sx={{ mb: 2 }}>Voltar</Button>
        <Typography variant="h4" textAlign="center" mb={3} fontWeight={600} color="primary">
          Cadastro
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
            label="Nome"
            variant="filled"
            margin="normal"
            value={name}
            onChange={(e) => { setName(e.target.value); setHelperTexts({ ...helperTexts, name: "" }) }}
            helperText={helperTexts.name}
            error={helperTexts.name !== ""}
            fullWidth
          />
          <TextField
            label="Email"
            variant="filled"
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setHelperTexts({ ...helperTexts, email: "" }) }}
            helperText={helperTexts.email}
            error={helperTexts.email !== ""}
            fullWidth
          />
          <TextField
            label="Senha"
            type="password"
            variant="filled"
            margin="normal"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setHelperTexts({ ...helperTexts, password: "" }) }}
            onBlur={() => { setHelperTexts({ ...helperTexts, confirmPassword: matchPasswords(password, confirmPassword) }) }}
            helperText={helperTexts.password}
            error={helperTexts.password !== ""}
            fullWidth
          />
          <TextField
            label="Confirmar senha"
            type="password"
            variant="filled"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value) }}
            onKeyUp={() => { setHelperTexts({ ...helperTexts, confirmPassword: matchPasswords(password, confirmPassword) }) }}
            helperText={helperTexts.confirmPassword}
            error={helperTexts.confirmPassword !== ""}
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={termsConfirmation}
                onChange={() => { setTermsConfirmation(!termsConfirmation); setHelperTexts({ ...helperTexts, termsConfirmation: "" }) }}
                sx={{ color: helperTexts.termsConfirmation ? "red" : "" }}
              />
            }
            sx={{ color: helperTexts.termsConfirmation ? "red" : "", mb: 2 }}
            label={`Concordo com os Termos e Condições do aplicativo`}
            required
          />
          <Button
            variant="contained"
            onClick={() => { if (everythingRight()) {handleSignupSubmit(); router.push('/access/login')} }}
            sx={{ py: 1.5, fontWeight: 600, px: 3 }}
            fullWidth
          >
            Cadastrar
          </Button>
        </FormControl>
      </Card>
    </Box>
  )
}
