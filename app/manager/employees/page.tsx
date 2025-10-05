'use client'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  TextField,
  Alert,
  Collapse,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";

export default function DoctorsRegistration() {
  const helperTextsBase = { name: "", email: "", password: "", crm: "", specialty: "", phone: "" };

  const [open, setOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    crm: "",
    specialty: "",
    phone: "",
  });

  const [helperTexts, setHelperTexts] = useState({ ...helperTextsBase });
  const [doctors, setDoctors] = useState<any[]>([]);

  const handleClose = () => setOpen(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setHelperTexts({ ...helperTexts, [field]: "" });
  };

  const validateEmail = (email: string) => {
    if (!email) return "Insira um email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email Inválido";
    return "";
  };

  const everythingRight = () => {
    const tempHelper = { ...helperTextsBase };

    if (!formData.name) tempHelper.name = "Insira um nome";
    tempHelper.email = validateEmail(formData.email);
    if (!formData.password) tempHelper.password = "Insira uma senha";
    if (!formData.crm) tempHelper.crm = "Insira o CRM";
    if (!formData.specialty) tempHelper.specialty = "Insira a especialidade";

    setHelperTexts(tempHelper);

    return Object.values(tempHelper).every((v) => v === "");
  };

  const handleSignupSubmit = async () => {
    if (!process.env.NEXT_PUBLIC_API_LINK) throw "API link not found";

    if (!everythingRight()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/doctors/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        setAlertOpen(true);
        setAlertMessage("Informações não aceitas na API");
        return;
      }

      const doctor = await response.json();
      setDoctors([...doctors, doctor]);
      setOpen(false);
      setFormData({ name: "", email: "", password: "", crm: "", specialty: "", phone: "" });
      setHelperTexts({ ...helperTextsBase });
    } catch (e) {
      console.log(e);
      setAlertOpen(true);
      setAlertMessage("Erro ao enviar as informações para a API");
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Nome", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "crm", headerName: "CRM", width: 100 },
    { field: "specialty", headerName: "Especialidade", width: 150 },
    { field: "phone", headerName: "Telefone", width: 150 },
  ];

  return (
    <Box>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Cadastrar Médico
      </Button>

      <DataGrid rows={doctors} columns={columns} pageSizeOptions={[5, 10]} checkboxSelection sx={{ border: 0, marginTop: 2 }} />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Cadastro de Médico</DialogTitle>
        <DialogContent>
          <Collapse in={alertOpen}>
            <Alert
              action={<Button size="small" onClick={() => setAlertOpen(false)}>Fechar</Button>}
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
              required
              fullWidth
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              helperText={helperTexts.name}
              error={helperTexts.name !== ""}
            />
            <TextField
              label="Email"
              variant="filled"
              margin="normal"
              required
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              helperText={helperTexts.email}
              error={helperTexts.email !== ""}
            />
            <TextField
              label="Senha"
              variant="filled"
              margin="normal"
              required
              type="password"
              fullWidth
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              helperText={helperTexts.password}
              error={helperTexts.password !== ""}
            />
            <TextField
              label="CRM"
              variant="filled"
              margin="normal"
              required
              fullWidth
              value={formData.crm}
              onChange={(e) => handleChange("crm", e.target.value)}
              helperText={helperTexts.crm}
              error={helperTexts.crm !== ""}
            />
            <TextField
              label="Especialidade"
              variant="filled"
              margin="normal"
              required
              fullWidth
              value={formData.specialty}
              onChange={(e) => handleChange("specialty", e.target.value)}
              helperText={helperTexts.specialty}
              error={helperTexts.specialty !== ""}
            />
            <TextField
              label="Telefone"
              variant="filled"
              margin="normal"
              fullWidth
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              helperText={helperTexts.phone}
              error={helperTexts.phone !== ""}
            />
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setFormData({ name: "", email: "", password: "", crm: "", specialty: "", phone: "" })
            }
          >
            Limpar
          </Button>
          <Button onClick={handleSignupSubmit} autoFocus>
            Cadastrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
