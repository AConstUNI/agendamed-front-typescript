'use client'

import { Box, Button, Card, FormControl, Link, TextField, Typography } from "@mui/material";

export default function Login() {
  return (
    <Box 
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="100vh"
    color={{background: "#344eb5ff"}}
    >
      <Card sx={{ p: 4, minWidth: 350, boxShadow: 3 }}>
      <Typography variant="h4" textAlign="center" mb={3} fontWeight={600} color="primary">
        Login
      </Typography>
      <FormControl fullWidth>
        <TextField
        label="Email"
        variant="filled"
        margin="normal"
        type="email"
        autoComplete="email"
        required
        fullWidth
        />
        <TextField
        label="Senha"
        type="password"
        variant="filled"
        margin="normal"
        autoComplete="current-password"
        required
        fullWidth
        />
        <Typography>Não possui conta? <Link href="/access/signup" underline="hover">Cadastrar conta</Link></Typography>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button
            variant="contained"
            type="submit"
            sx={{ py: 1.5, fontWeight: 600, px: 3 }}
          >
            Entrar
          </Button>
        </Box>
      </FormControl>
      </Card>
    </Box>
  )
}