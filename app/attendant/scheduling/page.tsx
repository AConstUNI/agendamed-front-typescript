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
  IconButton,
} from "@mui/material";
import { getUserSession } from "@/app/.lib/auth";
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

export default function AgendamentoPage() {
  const [pacienteId, setPacienteId] = useState<number | "">("");
  const [medicoId, setMedicoId] = useState<number | "">("");
  const [medicoInput, setMedicoInput] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [telefone, setTelefone] = useState("");
  const [sala, setSala] = useState("");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ message: string; severity: "success" | "error" | "info"; open: boolean }>({
    message: "",
    severity: "info",
    open: false,
  });

  const horariosDisponiveis = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const getMinDate = () => {
    const hoje = new Date();
    hoje.setDate(hoje.getDate());
    return hoje.toISOString().split("T")[0];
  };

  const getHorariosDisponiveis = () => {
    if (!data) return [];
    const agora = new Date();
    const hoje = agora.toISOString().split("T")[0];
    if (data > hoje) return horariosDisponiveis;
    if (data === hoje) {
      const horaAtual = agora.toTimeString().slice(0, 5);
      return horariosDisponiveis.filter(h => h > horaAtual);
    }
    return [];
  };

  const fetchPacientes = async () => {
    if (!process.env.NEXT_PUBLIC_API_LINK) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/users/all`);
      if (!res.ok) return;
      const data: Paciente[] = await res.json();
      setPacientes(data.filter(u => u.role?.toLowerCase() === "user"));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAgendamentos = async () => {
    if (!process.env.NEXT_PUBLIC_API_LINK) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/agendamento`);
      if (!res.ok) return;
      const data: Agendamento[] = await res.json();
      setAgendamentos(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMedicosDisponiveis = async () => {
    if (!data || !hora || !process.env.NEXT_PUBLIC_API_LINK) {
      setMedicos([]);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/agendamento/disponiveis?data=${data}&hora=${hora}`);
      if (!res.ok) { setMedicos([]); return; }
      const dataMedicos = await res.json();
      const mappedMedicos: Medico[] = dataMedicos.map((d: any) => ({
        id: d.id,
        name: `${d.user.name} - ${d.specialty}`,
        role: d.user.role,
        specialty: d.specialty,
      }));

      if (editando) {
        const ag = agendamentos.find(a => a.id === editando);
        if (ag && ag.medico && !mappedMedicos.some(m => m.id === ag.medicoId)) {
          mappedMedicos.push({
            id: ag.medico.id,
            name: `${ag.medico.user.name} - ${ag.medico.specialty}`,
            role: "doctor",
            specialty: ag.medico.specialty,
          });
        }
      }
      setMedicos(mappedMedicos);
    } catch (e) {
      console.error(e);
      setMedicos([]);
    }
  };

  useEffect(() => { fetchPacientes(); fetchAgendamentos(); }, []);
  useEffect(() => { fetchMedicosDisponiveis(); }, [data, hora, editando]);

  const showSnackbar = (message: string, severity: "success" | "error" | "info") => {
    setSnackbar({ message, severity, open: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteId || !medicoId || !data || !hora || !sala.trim() || !telefone.trim()) {
      showSnackbar("Preencha todos os campos obrigatórios!", "error");
      return;
    }
    try {
      const user = await getUserSession(sessionStorage.getItem("jwtToken") || '');
      const body = { pacienteId: Number(pacienteId), medicoId: Number(medicoId), data, hora, sala, telefone, who: user.email };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/agendamento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorData = await res.json();
        showSnackbar(errorData.message || "Erro ao salvar agendamento!", "error");
        return;
      }
      await fetchAgendamentos();
      showSnackbar("Agendamento salvo com sucesso!", "success");
      setPacienteId(""); setMedicoId(""); setMedicoInput(""); setData(""); setHora(""); setSala(""); setTelefone(""); setEditando(null);
    } catch (e) {
      console.error(e);
      showSnackbar("Erro ao criar agendamento. Tente novamente.", "error");
    }
  };

  const handleEditar = (a: Agendamento) => {
    setPacienteId(a.pacienteId); setMedicoId(a.medicoId); setData(a.data);
    setHora(a.hora); setSala(a.sala); setTelefone(a.telefone);
    setEditando(a.id); setMedicoInput(a.medico?.user?.name || "");
  };

  const handleCancelar = async (id: number) => {
    if (!confirm("Deseja realmente cancelar este agendamento?")) return;
    try {
      const user = await getUserSession(sessionStorage.getItem("jwtToken") || '');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/agendamento/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ who: user.email }),
      });
      if (!res.ok) throw new Error();
      setAgendamentos(agendamentos.filter(a => a.id !== id));
      showSnackbar("Agendamento cancelado com sucesso.", "info");
    } catch (e) {
      console.error(e);
      showSnackbar("Erro ao cancelar agendamento.", "error");
    }
  };

  const getUserNome = (id: number, tipo: "paciente" | "medico") => {
    const lista = tipo === "paciente" ? pacientes : medicos;
    return lista.find(u => u.id === id)?.name || "Desconhecido";
  };

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary.main">Agendamento de Consultas</Typography>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
          {/* Paciente */}
          <FormControl fullWidth>
            <InputLabel id='label-paciente'>Paciente</InputLabel>
            <Select
              labelId="label-paciente"
              label='Pacien'
              value={pacienteId}
              onChange={e => setPacienteId(e.target.value as number)}
              required
            >
              <MenuItem value=""><em>Selecione um paciente</em></MenuItem>
              {pacientes.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>

          {/* Telefone */}
          <TextField
            label="Telefone de Contato"
            fullWidth
            name="phone"
            value={telefone}
            onChange={e => setTelefone(e.target.value)}
            slotProps={{ input: { inputComponent: PhoneMaskCustom as any } }}
          />

          {/* Data */}
          <TextField
            label="Data da Consulta"
            type="date"
            value={data}
            onChange={e => setData(e.target.value)}
            slotProps={{ htmlInput: { min: getMinDate() }, inputLabel: {shrink: true} }}
            required
          />

          {/* Hora */}
          <FormControl fullWidth>
            <InputLabel id="horario-label">Horário</InputLabel>
            <Select labelId="horario-label" label="Horár" value={hora} onChange={e => setHora(e.target.value)} required>
              <MenuItem value=""><em>Selecione um horário</em></MenuItem>
              {getHorariosDisponiveis().map(h => <MenuItem key={h} value={h}>{h}</MenuItem>)}
            </Select>
          </FormControl>

          {/* Médico */}
          <Autocomplete
            options={medicos}
            getOptionLabel={option => option.name}
            value={medicos.find(m => m.id === medicoId) || null}
            inputValue={medicoInput}
            onInputChange={(e, newInput) => setMedicoInput(newInput)}
            onChange={(e, newValue) => setMedicoId(newValue ? newValue.id : "")}
            renderInput={params => <TextField {...params} label="Médico Disponível" required />}
          />

          {/* Sala */}
          <TextField label="Sala" value={sala} onChange={e => setSala(e.target.value)} required />

          <Button type="submit" variant="contained" color={editando ? "success" : "primary"} sx={{ mt: 2, py: 1.2, fontWeight: 600, textTransform: "none", borderRadius: 2 }}>
            {editando ? <>Salvar Alterações</> : "Confirmar Agendamento"}
          </Button>
        </Box>
      </Paper>

      {/* Agendamentos */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
        {agendamentos.length === 0 ? (
          <Typography sx={{ px: 3, pb: 3 }}>Nenhum agendamento registrado ainda.</Typography>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: "primary.light" }}>
                <TableRow>
                  {["ID", "Paciente", "Telefone", "Médico", "Data", "Hora", "Sala", "Ações"].map(col => (
                    <TableCell key={col} sx={{ fontWeight: 600, color: "#fff" }}>{col}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {agendamentos.map((a, i) => (
                  <TableRow key={a.id} sx={{ backgroundColor: i % 2 ? "grey.50" : "white", "&:hover": { backgroundColor: "action.hover" } }}>
                    <TableCell>{a.id}</TableCell>
                    <TableCell>{getUserNome(a.pacienteId, "paciente")}</TableCell>
                    <TableCell>{a.telefone}</TableCell>
                    <TableCell>{a.medico?.user?.name}</TableCell>
                    <TableCell>{a.data}</TableCell>
                    <TableCell>{a.hora}</TableCell>
                    <TableCell>{a.sala}</TableCell>
                    <TableCell >
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
                          Deletar
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
