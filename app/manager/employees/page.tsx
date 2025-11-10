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
  Typography,
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
      definitions={{ '0': /[0-9]/ }}
      inputRef={ref}
      onAccept={(value: string) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

export default function StaffRegistration() {
  const doctorHelperTextsBase = { name: "", email: "", password: "", crm: "", specialty: "", phone: "" };
  const attendantHelperTextsBase = { name: "", email: "", password: "" };

  const [doctorOpen, setDoctorOpen] = useState(false);
  const [doctorAlertOpen, setDoctorAlertOpen] = useState(false);
  const [doctorAlertMessage, setDoctorAlertMessage] = useState("");
  const [doctorFormData, setDoctorFormData] = useState({ name: "", email: "", password: "", crm: "", specialty: "", phone: "" });
  const [doctorHelperTexts, setDoctorHelperTexts] = useState({ ...doctorHelperTextsBase });

  const [attendantOpen, setAttendantOpen] = useState(false);
  const [attendantAlertOpen, setAttendantAlertOpen] = useState(false);
  const [attendantAlertMessage, setAttendantAlertMessage] = useState("");
  const [attendantFormData, setAttendantFormData] = useState({ name: "", email: "", password: "" });
  const [attendantHelperTexts, setAttendantHelperTexts] = useState({ ...attendantHelperTextsBase });

  const [users, setUsers] = useState<any[]>([]);

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email inválido";
    return "";
  };

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
    if (!process.env.NEXT_PUBLIC_API_LINK) return;
    if (!doctorEverythingRight()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/doctors/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctorFormData),
      });

      if (!response.ok) {
        setDoctorAlertOpen(true);
        setDoctorAlertMessage("Informações não aceitas pela API");
        return;
      }

      setDoctorOpen(false);
      setDoctorFormData({ name: "", email: "", password: "", crm: "", specialty: "", phone: "" });
      setDoctorHelperTexts({ ...doctorHelperTextsBase });
      fetchUsers();
    } catch (e) {
      setDoctorAlertOpen(true);
      setDoctorAlertMessage("Erro ao enviar as informações para a API");
    }
  };

  const attendantEverythingRight = () => {
    const tempHelper = { ...attendantHelperTextsBase };
    if (!attendantFormData.name) tempHelper.name = "Insira um nome";
    tempHelper.email = validateEmail(attendantFormData.email);
    if (!attendantFormData.password) tempHelper.password = "Insira uma senha";
    setAttendantHelperTexts(tempHelper);
    return Object.values(tempHelper).every(v => v === "");
  };

  const handleAttendantSubmit = async () => {
    if (!process.env.NEXT_PUBLIC_API_LINK) return;
    if (!attendantEverythingRight()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/users/attendants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendantFormData),
      });

      if (!response.ok) {
        setAttendantAlertOpen(true);
        setAttendantAlertMessage("Informações não aceitas pela API");
        return;
      }

      setAttendantOpen(false);
      setAttendantFormData({ name: "", email: "", password: "" });
      setAttendantHelperTexts({ ...attendantHelperTextsBase });
      fetchUsers();
    } catch (e) {
      setAttendantAlertOpen(true);
      setAttendantAlertMessage("Erro ao enviar as informações para a API");
    }
  };

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

  useEffect(() => { fetchUsers(); }, []);

  const userColumns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Nome", width: 200 },
    { field: "email", headerName: "Email", width: 250 },
    { field: "role", headerName: "Função", width: 150 },
  ];

  const dialogStyle = {
    borderRadius: 3,
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    backgroundColor: "#fdfdfd",
  };

  const buttonStyle = {
    borderRadius: 2,
    textTransform: "none",
    fontWeight: 600,
    py: 1.2,
    px: 3,
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button variant="contained" color="primary" sx={buttonStyle} onClick={() => setDoctorOpen(true)}>
          Cadastrar Médico
        </Button>
        <Button variant="contained" color="secondary" sx={buttonStyle} onClick={() => setAttendantOpen(true)}>
          Cadastrar Atendente
        </Button>
      </Box>

      {/* Users Table */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
      <DataGrid
        rows={users}
        columns={userColumns}
        pageSizeOptions={[5, 10, 25]}
        sx={{
          border: 0,
          borderRadius: 2,
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f3f6f9",
            fontWeight: 700,
            fontSize: 14,
            color: "#344eb5",
          },
          "& .MuiDataGrid-row": {
            transition: "all 0.2s",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "rgba(52, 78, 181, 0.08)",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: "#f9f9f9",
          },
        }}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
        }
      />
      </div>

      {/* Doctor Dialog */}
      <Dialog open={doctorOpen} onClose={() => setDoctorOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogStyle }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          Cadastro de Médico
        </DialogTitle>
        <DialogContent>
          <Collapse in={doctorAlertOpen} sx={{ mb: 2 }}>
            <Alert severity="error" action={<Button size="small" onClick={() => setDoctorAlertOpen(false)}>Fechar</Button>}>
              {doctorAlertMessage}
            </Alert>
          </Collapse>
          <FormControl fullWidth>
            {['name', 'email', 'password', 'crm', 'specialty', 'phone'].map((field) => (
              <TextField
                key={field}
                label={field === 'crm' ? 'CRM' : field.charAt(0).toUpperCase() + field.slice(1)}
                variant="outlined"
                margin="normal"
                fullWidth
                type={field === 'password' ? 'password' : 'text'}
                value={(doctorFormData as any)[field]}
                onChange={(e) => handleChange('doctor', field, e.target.value)}
                helperText={(doctorHelperTexts as any)[field]}
                error={(doctorHelperTexts as any)[field] !== ""}
                InputProps={field === 'phone' ? { inputComponent: PhoneMaskCustom as any } : undefined}
              />
            ))}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDoctorFormData({ name: "", email: "", password: "", crm: "", specialty: "", phone: "" })}>Limpar</Button>
          <Button variant="contained" color="primary" onClick={handleDoctorSubmit}>Cadastrar</Button>
        </DialogActions>
      </Dialog>

      {/* Attendant Dialog */}
      <Dialog open={attendantOpen} onClose={() => setAttendantOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogStyle }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          Cadastro de Atendente
        </DialogTitle>
        <DialogContent>
          <Collapse in={attendantAlertOpen} sx={{ mb: 2 }}>
            <Alert severity="error" action={<Button size="small" onClick={() => setAttendantAlertOpen(false)}>Fechar</Button>}>
              {attendantAlertMessage}
            </Alert>
          </Collapse>
          <FormControl fullWidth>
            {['name', 'email', 'password'].map((field) => (
              <TextField
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                variant="outlined"
                margin="normal"
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
          <Button variant="contained" color="secondary" onClick={handleAttendantSubmit}>Cadastrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
