"use client";

import { useState, useEffect, forwardRef } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Autocomplete,
  Snackbar,
  Alert,
} from "@mui/material";
import { getUserSession } from "../.lib/auth";
import { IMaskInput } from "react-imask";

interface Agendamento {
  id: number;
  pacienteId: number;
  medicoId: number;
  data: string;
  hora: string;
  sala: string;
  telefone: string;
  active?: boolean;
  paciente?: { id: number; name: string };
  medico?: {
    id: number;
    crm: string;
    specialty: string;
    phone: string;
    user: { id: number; name: string };
  };
}

interface Paciente {
  id: number;
  name: string;
  role: string;
}

interface Medico {
  id: number;
  name: string;
  role: string;
  specialty: string;
}

// Phone Input Mask
const PhoneMaskCustom = forwardRef(function PhoneMaskCustom(
  props: any,
  ref: React.Ref<HTMLInputElement>
) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="(00) 00000-0000"
      definitions={{ "0": /[0-9]/ }}
      inputRef={ref}
      onAccept={(value: string) =>
        onChange({ target: { name: props.name, value } })
      }
      overwrite
    />
  );
});

export default function AgendamentoPage() {
  const [pacienteId, setPacienteId] = useState<number | "">("");
  const [medicoId, setMedicoId] = useState<number | "">("");
  const [medicoInput, setMedicoInput] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [telefone, setTelefone] = useState("");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    message: string;
    severity: "success" | "error" | "info";
    open: boolean;
  }>({ message: "", severity: "info", open: false });

  const horariosDisponiveis = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const getMinDate = () => {
    const hoje = new Date();
    hoje.setDate(hoje.getDate() + 1);
    return hoje.toISOString().split("T")[0];
  };

  const getHorariosDisponiveis = () => {
    if (!data) return [];
    const hoje = new Date().toISOString().split("T")[0];
    const agora = new Date();
    if (data > hoje) return horariosDisponiveis;
    if (data === hoje) {
      const horaAtual =
        `${agora.getHours()}`.padStart(2, "0") +
        ":" +
        `${agora.getMinutes()}`.padStart(2, "0");
      return horariosDisponiveis.filter((h) => h > horaAtual);
    }
    return [];
  };

  const fetchPacientes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/users/all`);
      if (!res.ok) return;
      const data: Paciente[] = await res.json();
      setPacientes(data.filter((u) => u.role === "USER" || u.role === "user"));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAgendamentos = async () => {
    const jwt = sessionStorage.getItem("jwtToken");
    if (!jwt) return;

    const user = await getUserSession(jwt);
    if (!user) return;
    setPacienteId(user.id);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_LINK}/agendamento/filtro?pacienteId=${user.id}`,
        { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" }
      );
      if (!res.ok) return;
      const data: Agendamento[] = await res.json();
      setAgendamentos(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMedicosDisponiveis = async () => {
    if (!data || !hora) return setMedicos([]);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_LINK}/agendamento/disponiveis?data=${data}&hora=${hora}`
      );
      if (!res.ok) return setMedicos([]);

      const raw = await res.json();
      const mapped = raw.map((d: any) => ({
        id: d.id,
        name: `${d.user.name} - ${d.specialty}`,
        role: d.user.role,
        specialty: d.specialty,
      }));

      setMedicos(mapped);
    } catch {
      setMedicos([]);
    }
  };

  useEffect(() => {
    fetchPacientes();
    fetchAgendamentos();
  }, []);

  useEffect(() => {
    fetchMedicosDisponiveis();
  }, [data, hora, editando]);

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info"
  ) => setSnackbar({ message, severity, open: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!medicoId || !data || !hora || !telefone.trim()) {
      showSnackbar("Preencha todos os campos obrigatórios!", "error");
      return;
    }

    try {
      const user = await getUserSession(sessionStorage.getItem("jwtToken") || "");

      if (editando) {
        showSnackbar("Para editar, primeiro exclua o agendamento.", "info");
        await handleCancelar(editando);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/agendamento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pacienteId,
          medicoId,
          data,
          hora,
          sala: "Volte mais tarde",
          telefone,
          who: user.email,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        showSnackbar(error.message || "Erro ao criar agendamento!", "error");
        return;
      }

      fetchAgendamentos();
      showSnackbar("Agendamento criado com sucesso!", "success");

      setMedicoId("");
      setData("");
      setHora("");
      setTelefone("");
      setMedicoInput("");
      setEditando(null);
    } catch (err) {
      console.error(err);
      showSnackbar("Erro inesperado. Tente novamente.", "error");
    }
  };

  const handleEditar = (a: Agendamento) => {
    setMedicoId(a.medicoId);
    setData(a.data);
    setHora(a.hora);
    setTelefone(a.telefone);
    setMedicoInput(a.medico?.user?.name || "");
    setEditando(a.id);
  };

  const handleCancelar = async (id: number) => {
    if (!confirm("Deseja realmente cancelar este agendamento?")) return;

    try {
      const user = await getUserSession(sessionStorage.getItem("jwtToken") || "");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/agendamento/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ who: user.email }),
      });

      if (!res.ok) throw new Error();

      setAgendamentos((prev) => prev.filter((a) => a.id !== id));
      showSnackbar("Agendamento cancelado.", "info");
    } catch {
      showSnackbar("Erro ao cancelar agendamento.", "error");
    }
  };

  const getUserNome = (id: number) =>
    pacientes.find((p) => p.id === id)?.name || "Desconhecido";

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary.main">
        Minhas Consultas - {getUserNome(Number(pacienteId))}
      </Typography>

      {/* FORM */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
          {/* Telefone */}
          <TextField
            label="Telefone de Contato"
            fullWidth
            name="phone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            slotProps={{ input: { inputComponent: PhoneMaskCustom as any } }}
            required
          />

          <TextField
            label="Data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: getMinDate() } }}
            required
          />

          <FormControl fullWidth>
            <InputLabel id="label-hora">Horário</InputLabel>
            <Select
              labelId="label-hora"
              label="Horário"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
            >
              <MenuItem value="">
                <em>Selecione um horário</em>
              </MenuItem>
              {getHorariosDisponiveis().map((h) => (
                <MenuItem key={h} value={h}>
                  {h}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            options={medicos}
            getOptionLabel={(option) => option.name}
            value={medicos.find((m) => m.id === medicoId) || null}
            inputValue={medicoInput}
            onInputChange={(e, v) => setMedicoInput(v)}
            onChange={(e, val) => setMedicoId(val ? val.id : "")}
            renderInput={(params) => <TextField {...params} label="Médico Disponível" />}
          />

          <Button
            type="submit"
            variant="contained"
            color={editando ? "success" : "primary"}
            sx={{ mt: 2, py: 1.2, borderRadius: 2, fontWeight: 600, textTransform: "none" }}
          >
            {editando ? "Salvar Alterações" : "Confirmar Agendamento"}
          </Button>
        </Box>
      </Paper>

      {/* TABLE */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
        {agendamentos.length === 0 ? (
          <Typography sx={{ px: 3, py: 3 }}>Nenhum agendamento registrado ainda.</Typography>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: "primary.light" }}>
                <TableRow>
                  {["ID", "Telefone", "Médico", "Data", "Hora", "Sala", "Ações"].map((col) => (
                    <TableCell key={col} sx={{ fontWeight: 600, color: "#fff" }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {agendamentos.map((a, i) => (
                  <TableRow
                    key={a.id}
                    sx={{
                      backgroundColor: i % 2 ? "grey.50" : "white",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <TableCell>{a.id}</TableCell>
                    <TableCell>{a.telefone}</TableCell>
                    <TableCell>{a.medico?.user?.name}</TableCell>
                    <TableCell>{a.data}</TableCell>
                    <TableCell>{a.hora}</TableCell>
                    <TableCell>{a.sala}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          color="warning"
                          size="small"
                          onClick={() => handleEditar(a)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleCancelar(a.id)}
                        >
                          Cancelar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
