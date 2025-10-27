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
import { useState, useEffect, forwardRef } from "react";
import { IMaskInput } from "react-imask";

// Phone input component
const PhoneMaskCustom = forwardRef(function PhoneMaskCustom(
  props: any,
  ref: React.Ref<HTMLInputElement>,
) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="(00) 00000-0000"
      definitions={{
        '0': /[0-9]/,
      }}
      inputRef={ref}
      onAccept={(value: string) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

export default function StaffRegistration() {
  // -------------------- Doctor State --------------------
  const doctorHelperTextsBase = { name: "", email: "", password: "", crm: "", specialty: "", phone: "" };
  const [doctorOpen, setDoctorOpen] = useState(false);
  const [doctorAlertOpen, setDoctorAlertOpen] = useState(false);
  const [doctorAlertMessage, setDoctorAlertMessage] = useState("");
  const [doctorFormData, setDoctorFormData] = useState({
    name: "", email: "", password: "", crm: "", specialty: "", phone: ""
  });
  const [doctorHelperTexts, setDoctorHelperTexts] = useState({ ...doctorHelperTextsBase });

  // -------------------- Attendant State --------------------
  const attendantHelperTextsBase = { name: "", email: "", password: "" };
  const [attendantOpen, setAttendantOpen] = useState(false);
  const [attendantAlertOpen, setAttendantAlertOpen] = useState(false);
  const [attendantAlertMessage, setAttendantAlertMessage] = useState("");
  const [attendantFormData, setAttendantFormData] = useState({ name: "", email: "", password: "" });
  const [attendantHelperTexts, setAttendantHelperTexts] = useState({ ...attendantHelperTextsBase });

  // -------------------- Users Table --------------------
  const [users, setUsers] = useState<any[]>([]);

  // -------------------- Helpers --------------------
  const handleChange = (form: 'doctor' | 'attendant', field: string, value: string) => {
    if (form === 'doctor') {
      setDoctorFormData({ ...doctorFormData, [field]: value });
      setDoctorHelperTexts({ ...doctorHelperTexts, [field]: "" });
    } else {
      setAttendantFormData({ ...attendantFormData, [field]: value });
      setAttendantHelperTexts({ ...attendantHelperTexts, [field]: "" });
    }
  };

  const validateEmail = (email: string) => {
    if (!email) return "Insira um email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email Inválido";
    return "";
  };

  // -------------------- Doctor Functions --------------------
  const doctorEverythingRight = () => {
    const tempHelper = { ...doctorHelperTextsBase };
    if (!doctorFormData.name) tempHelper.name = "Insira um nome";
    tempHelper.email = validateEmail(doctorFormData.email);
    if (!doctorFormData.password) tempHelper.password = "Insira uma senha";
    if (!doctorFormData.crm) tempHelper.crm = "Insira o CRM";
    if (!doctorFormData.specialty) tempHelper.specialty = "Insira a especialidade";
    setDoctorHelperTexts(tempHelper);
    return Object.values(tempHelper).every(v => v === "");
  };

  const handleDoctorSubmit = async () => {
    if (!process.env.NEXT_PUBLIC_API_LINK) throw "API link not found";
    if (!doctorEverythingRight()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/doctors/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctorFormData),
      });

      if (!response.ok) {
        setDoctorAlertOpen(true);
        setDoctorAlertMessage("Informações não aceitas na API");
        return;
      }

      setDoctorOpen(false);
      setDoctorFormData({ name: "", email: "", password: "", crm: "", specialty: "", phone: "" });
      setDoctorHelperTexts({ ...doctorHelperTextsBase });
      fetchUsers();
    } catch (e) {
      console.log(e);
      setDoctorAlertOpen(true);
      setDoctorAlertMessage("Erro ao enviar as informações para a API");
    }
  };

  // -------------------- Attendant Functions --------------------
  const attendantEverythingRight = () => {
    const tempHelper = { ...attendantHelperTextsBase };
    if (!attendantFormData.name) tempHelper.name = "Insira um nome";
    tempHelper.email = validateEmail(attendantFormData.email);
    if (!attendantFormData.password) tempHelper.password = "Insira uma senha";
    setAttendantHelperTexts(tempHelper);
    return Object.values(tempHelper).every(v => v === "");
  };

  const handleAttendantSubmit = async () => {
    if (!process.env.NEXT_PUBLIC_API_LINK) throw "API link not found";
    if (!attendantEverythingRight()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/users/attendants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendantFormData),
      });

      if (!response.ok) {
        setAttendantAlertOpen(true);
        setAttendantAlertMessage("Informações não aceitas na API");
        return;
      }

      setAttendantOpen(false);
      setAttendantFormData({ name: "", email: "", password: "" });
      setAttendantHelperTexts({ ...attendantHelperTextsBase });
      fetchUsers();
    } catch (e) {
      console.log(e);
      setAttendantAlertOpen(true);
      setAttendantAlertMessage("Erro ao enviar as informações para a API");
    }
  };

  // -------------------- Fetch Users --------------------
  const fetchUsers = async () => {
    if (!process.env.NEXT_PUBLIC_API_LINK) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/users/all`);
      if (!response.ok) return;
      const data = await response.json();
      setUsers(data);
    } catch (e) {
      console.log(e);
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
        <Button variant="outlined" onClick={() => setDoctorOpen(true)}>Cadastrar Médico</Button>
        <Button variant="outlined" onClick={() => setAttendantOpen(true)}>Cadastrar Atendente</Button>
      </Box>

      {/* Users Table */}
      <DataGrid rows={users} columns={userColumns} pageSizeOptions={[5, 10]} checkboxSelection sx={{ border: 0, mb: 2 }} />

      {/* Doctor Dialog */}
      <Dialog open={doctorOpen} onClose={() => setDoctorOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cadastro de Médico</DialogTitle>
        <DialogContent>
          <Collapse in={doctorAlertOpen}>
            <Alert
              action={
                <Button size="small" onClick={() => setDoctorAlertOpen(false)}>
                  Fechar
                </Button>
              }
              severity="error"
              sx={{ mb: 2 }}
            >
              {doctorAlertMessage}
            </Alert>
          </Collapse>

          <FormControl fullWidth>
            {/* Name */}
            <TextField
              label="Nome"
              variant="filled"
              margin="normal"
              fullWidth
              required
              value={doctorFormData.name}
              onChange={(e) => handleChange('doctor', 'name', e.target.value)}
              helperText={doctorHelperTexts.name}
              error={doctorHelperTexts.name !== ""}
            />

            {/* Email */}
            <TextField
              label="Email"
              variant="filled"
              margin="normal"
              fullWidth
              required
              value={doctorFormData.email}
              onChange={(e) => handleChange('doctor', 'email', e.target.value)}
              helperText={doctorHelperTexts.email}
              error={doctorHelperTexts.email !== ""}
            />

            {/* Password */}
            <TextField
              label="Senha"
              variant="filled"
              margin="normal"
              fullWidth
              required
              type="password"
              value={doctorFormData.password}
              onChange={(e) => handleChange('doctor', 'password', e.target.value)}
              helperText={doctorHelperTexts.password}
              error={doctorHelperTexts.password !== ""}
            />

            {/* CRM */}
            <TextField
              label="CRM"
              variant="filled"
              margin="normal"
              fullWidth
              required
              value={doctorFormData.crm}
              onChange={(e) => handleChange('doctor', 'crm', e.target.value)}
              helperText={doctorHelperTexts.crm}
              error={doctorHelperTexts.crm !== ""}
            />

            {/* Specialty */}
            <TextField
              label="Especialidade"
              variant="filled"
              margin="normal"
              fullWidth
              required
              value={doctorFormData.specialty}
              onChange={(e) => handleChange('doctor', 'specialty', e.target.value)}
              helperText={doctorHelperTexts.specialty}
              error={doctorHelperTexts.specialty !== ""}
            />

            {/* Phone with mask */}
            <TextField
              label="Telefone"
              variant="filled"
              margin="normal"
              fullWidth
              name="phone"
              value={doctorFormData.phone}
              onChange={(e) => handleChange('doctor', 'phone', e.target.value)}
              InputProps={{
                inputComponent: PhoneMaskCustom as any,
              }}
              helperText={doctorHelperTexts.phone}
              error={doctorHelperTexts.phone !== ""}
            />
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setDoctorFormData({ name: "", email: "", password: "", crm: "", specialty: "", phone: "" })
            }
          >
            Limpar
          </Button>
          <Button onClick={handleDoctorSubmit} autoFocus>
            Cadastrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attendant Dialog */}
      <Dialog open={attendantOpen} onClose={() => setAttendantOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cadastro de Atendente</DialogTitle>
        <DialogContent>
          <Collapse in={attendantAlertOpen}>
            <Alert action={<Button size="small" onClick={() => setAttendantAlertOpen(false)}>Fechar</Button>} severity="error" sx={{ mb: 2 }}>
              {attendantAlertMessage}
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
                value={(attendantFormData as any)[field]}
                onChange={(e) => handleChange('attendant', field, e.target.value)}
                helperText={(attendantHelperTexts as any)[field]}
                error={(attendantHelperTexts as any)[field] !== ""}
              />
            ))}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttendantFormData({ name: "", email: "", password: "" })}>Limpar</Button>
          <Button onClick={handleAttendantSubmit} autoFocus>Cadastrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
