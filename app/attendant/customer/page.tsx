'use client'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
  Alert,
  Collapse,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState, useEffect } from "react";

export default function CustomerRegistration() {
  // -------------------- Customer State --------------------
  const customerHelperTextsBase = { name: "", email: "", password: "" };
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerAlertOpen, setCustomerAlertOpen] = useState(false);
  const [customerAlertMessage, setCustomerAlertMessage] = useState("");
  const [customerFormData, setCustomerFormData] = useState({ name: "", email: "", password: "" });
  const [customerHelperTexts, setCustomerHelperTexts] = useState({ ...customerHelperTextsBase });

  // -------------------- Users Table --------------------
  const [users, setUsers] = useState<any[]>([]);

  // -------------------- Helpers --------------------
  const handleChange = (field: string, value: string) => {
    setCustomerFormData({ ...customerFormData, [field]: value });
    setCustomerHelperTexts({ ...customerHelperTexts, [field]: "" });
  };

  const validateEmail = (email: string) => {
    if (!email) return "Insira um email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email Inválido";
    return "";
  };


  // -------------------- Customer Functions --------------------
  const customerEverythingRight = () => {
    const tempHelper = { ...customerHelperTextsBase };
    if (!customerFormData.name) tempHelper.name = "Insira um nome";
    tempHelper.email = validateEmail(customerFormData.email);
    if (!customerFormData.password) tempHelper.password = "Insira uma senha";
    setCustomerHelperTexts(tempHelper);
    return Object.values(tempHelper).every(v => v === "");
  };

  const handleCustomerSubmit = async () => {
    if (!process.env.NEXT_PUBLIC_API_LINK) throw "API link not found";
    if (!customerEverythingRight()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerFormData),
      });

      if (!response.ok) {
        setCustomerAlertOpen(true);
        setCustomerAlertMessage("Informações não aceitas na API");
        return;
      }

      setCustomerOpen(false);
      setCustomerFormData({ name: "", email: "", password: "" });
      setCustomerHelperTexts({ ...customerHelperTextsBase });
      fetchUsers();
    } catch (e) {
      console.log(e);
      setCustomerAlertOpen(true);
      setCustomerAlertMessage("Erro ao enviar as informações para a API");
    }
  };

  // -------------------- Fetch Users --------------------
  const fetchUsers = async () => {
    if (!process.env.NEXT_PUBLIC_API_LINK) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/users/all`);
      if (!response.ok) return;

      const data = await response.json();

      // Filtra apenas usuários com role === 'user'
      const filteredUsers = data.filter((user: { role: string; }) => user.role === 'user');

      setUsers(filteredUsers);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // -------------------- Columns --------------------
  const userColumns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Nome", width: 200 },
    { field: "email", headerName: "Email", width: 250 },
    { field: "role", headerName: "Função", width: 150 },
  ];

  return (
    <Box>
      {/* Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="outlined" onClick={() => setCustomerOpen(true)}>Cadastrar Cliente</Button>
      </Box>

      {/* Users Table */}
      <DataGrid rows={users} columns={userColumns} pageSizeOptions={[5, 10]} checkboxSelection sx={{ border: 0, mb: 2 }} />


      {/* Customer Dialog */}
      <Dialog open={customerOpen} onClose={() => setCustomerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cadastro de Atendente</DialogTitle>
        <DialogContent>
          <Collapse in={customerAlertOpen}>
            <Alert action={<Button size="small" onClick={() => setCustomerAlertOpen(false)}>Fechar</Button>} severity="error" sx={{ mb: 2 }}>
              {customerAlertMessage}
            </Alert>
          </Collapse>
          <FormControl fullWidth>
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
                onChange={(e) => handleChange(field, e.target.value)}
                helperText={(customerHelperTexts as any)[field]}
                error={(customerHelperTexts as any)[field] !== ""}
              />
            ))}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerFormData({ name: "", email: "", password: "" })}>Limpar</Button>
          <Button onClick={handleCustomerSubmit} autoFocus>Cadastrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
