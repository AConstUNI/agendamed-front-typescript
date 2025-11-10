'use client';

import { useState, useEffect } from "react";
import { getUserSession } from "@/app/.lib/auth";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Alert,
  Collapse,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

export default function CustomerRegistration() {
  // -------------------- Customer State --------------------
  const emptyForm = { name: "", email: "", password: "" };
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerAlertOpen, setCustomerAlertOpen] = useState(false);
  const [customerAlertMessage, setCustomerAlertMessage] = useState("");
  const [customerFormData, setCustomerFormData] = useState({ ...emptyForm });
  const [customerHelperTexts, setCustomerHelperTexts] = useState({ ...emptyForm });

  // -------------------- Users Table --------------------
  const [users, setUsers] = useState<any[]>([]);

  // -------------------- Helpers --------------------
  const handleChange = (field: keyof typeof customerFormData, value: string) => {
    setCustomerFormData(prev => ({ ...prev, [field]: value }));
    setCustomerHelperTexts(prev => ({ ...prev, [field]: "" }));
  };

  const validateEmail = (email: string) => {
    if (!email) return "Insira um email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email inválido";
    return "";
  };

  const customerEverythingRight = () => {
    const tempHelper = { ...emptyForm };
    if (!customerFormData.name) tempHelper.name = "Insira um nome";
    tempHelper.email = validateEmail(customerFormData.email);
    if (!customerFormData.password) tempHelper.password = "Insira uma senha";
    setCustomerHelperTexts(tempHelper);
    return Object.values(tempHelper).every(v => v === "");
  };

  // -------------------- Fetch Users --------------------
  const fetchUsers = async () => {
    if (!process.env.NEXT_PUBLIC_API_LINK) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/users/all`);
      if (!response.ok) return;
      const data = await response.json();
      setUsers(data.filter((u: any) => u.role === "user"));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // -------------------- Customer Functions --------------------
  const handleCustomerSubmit = async () => {
    if (!process.env.NEXT_PUBLIC_API_LINK) throw new Error("API link not found");
    if (!customerEverythingRight()) return;

    try {
      const user = await getUserSession(sessionStorage.getItem("jwtToken") || '');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...customerFormData, who: user.email }),
      });

      if (!response.ok) {
        setCustomerAlertMessage("Informações não aceitas na API");
        setCustomerAlertOpen(true);
        return;
      }

      setCustomerOpen(false);
      resetForm();
      fetchUsers();
    } catch (e) {
      console.error(e);
      setCustomerAlertMessage("Erro ao enviar as informações para a API");
      setCustomerAlertOpen(true);
    }
  };

  const resetForm = () => {
    setCustomerFormData({ ...emptyForm });
    setCustomerHelperTexts({ ...emptyForm });
    setCustomerAlertOpen(false);
  };

  // Auto-close alert after 5 seconds
  useEffect(() => {
    if (customerAlertOpen) {
      const timer = setTimeout(() => setCustomerAlertOpen(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [customerAlertOpen]);

  // -------------------- DataGrid Columns --------------------
  const userColumns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Nome", width: 200 },
    { field: "email", headerName: "Email", width: 250 },
    { field: "role", headerName: "Função", width: 150 },
  ];

  const buttonStyle = {
    borderRadius: 2,
    textTransform: "none",
    fontWeight: 600,
    py: 1.2,
    px: 3,
  };

  return (
    <Box>
      {/* Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="contained" color="success" sx={buttonStyle} onClick={() => setCustomerOpen(true)}>
          Cadastrar Cliente
        </Button>
      </Box>

      {/* Users Table */}
      {users.length === 0 ? (
        <Typography>Nenhum usuário registrado ainda.</Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            mb: 2,
            borderRadius: 2,
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f3f6f9" }}>
                {["ID", "Nome", "Email"].map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#344eb5",
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {users.map((user, i) => (
                <TableRow
                  key={user.id}
                  sx={{
                    backgroundColor: i % 2 === 0 ? "white" : "grey.50",
                    transition: "all 0.2s",
                    "&:hover": { backgroundColor: "rgba(52, 78, 181, 0.08)" },
                  }}
                >
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

      )}

      {/* Customer Dialog */}
      <Dialog
        open={customerOpen}
        onClose={() => { setCustomerOpen(false); resetForm(); }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cadastro de Cliente</DialogTitle>
        <DialogContent>
          <Collapse in={customerAlertOpen} sx={{ mb: 2 }}>
            <Alert
              severity="error"
              action={<Button size="small" onClick={() => setCustomerAlertOpen(false)}>Fechar</Button>}
            >
              {customerAlertMessage}
            </Alert>
          </Collapse>

          {['name', 'email', 'password'].map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              variant="filled"
              margin="normal"
              required
              fullWidth
              type={field === 'password' ? 'password' : 'text'}
              value={(customerFormData as any)[field]}
              onChange={(e) => handleChange(field as any, e.target.value)}
              helperText={(customerHelperTexts as any)[field]}
              error={(customerHelperTexts as any)[field] !== ""}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm}>Limpar</Button>
          <Button onClick={handleCustomerSubmit} autoFocus>
            Cadastrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>

  );
}
