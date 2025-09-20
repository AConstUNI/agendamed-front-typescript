'use client'

import { Box, Button, Card, Checkbox, FormControl, FormControlLabel, Link, TextField, Typography } from "@mui/material";

export default function Signup() {
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
        Cadastro
      </Typography>
      <FormControl fullWidth>
        <TextField
        label="Nome"
        variant="filled"
        margin="normal"
        autoComplete="email"
        required
        fullWidth
        />
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
        <TextField
        label="Confirmar senha"
        type="password"
        variant="filled"
        margin="normal"
        autoComplete="current-password"
        required
        fullWidth
        />
        <FormControlLabel 
        control={<Checkbox/>} 
        label={`Concordo com os Termos e Condições do aplicativo`}
        required
        />
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button
            variant="contained"
            type="submit"
            sx={{ py: 1.5, fontWeight: 600, px: 3 }}
          >
            Cadastrar
          </Button>
        </Box>
      </FormControl>
      </Card>
    </Box>
  )
}