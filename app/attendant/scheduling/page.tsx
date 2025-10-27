"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

interface Agendamento {
  id: number;
  pacienteId: number;
  medicoId: number;
  data: string;
  hora: string;
  sala: string;
  telefone: string;
  medico?: { id: number; name: string; specialty: string };
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

export default function AgendamentoPage() {
  const [pacienteId, setPacienteId] = useState<number | "">("");
  const [medicoId, setMedicoId] = useState<number | "">("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [sala, setSala] = useState("");
  const [telefone, setTelefone] = useState("");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);

  const horariosDisponiveis = [
    "08:00","08:30","09:00","09:30","10:00","10:30",
    "11:00","11:30","13:00","13:30","14:00","14:30",
    "15:00","15:30","16:00","16:30","17:00"
  ];

  const fetchPacientes = async () => {
    if (!process.env.NEXT_PUBLIC_API_LINK) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/users/all`);
      if (!res.ok) return;
      const data: Paciente[] = await res.json();
      setPacientes(data.filter((u) => u.role?.toLowerCase() === "user"));
    } catch (e) {
      console.error("Erro ao buscar pacientes:", e);
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
      console.error("Erro ao buscar agendamentos:", e);
    }
  };

  const fetchMedicosDisponiveis = async () => {
    if (!data || !hora || !process.env.NEXT_PUBLIC_API_LINK) {
      setMedicos([]);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_LINK}/agendamento/disponiveis?data=${data}&hora=${hora}`
      );
      if (!res.ok) {
        setMedicos([]);
        return;
      }

      const dataMedicos = await res.json();

      const mappedMedicos: Medico[] = dataMedicos.map((d: any) => ({
        id: d.id,
        name: `${d.user.name} - ${d.specialty}`,
        role: d.user.role,
        specialty: d.specialty,
      }));

      if (editando) {
        const ag = agendamentos.find(a => a.id === editando);
        if (ag && !mappedMedicos.some(m => m.id === ag.medicoId) && ag.medico) {
          mappedMedicos.push({
            id: ag.medico.id,
            name: `${ag.medico.name} - ${ag.medico.specialty}`,
            role: "doctor",
            specialty: ag.medico.specialty,
          });
        }
      }

      setMedicos(mappedMedicos);
    } catch (e) {
      console.error("Erro ao buscar médicos:", e);
      setMedicos([]);
    }
  };

  useEffect(() => { fetchPacientes(); fetchAgendamentos(); }, []);
  useEffect(() => { fetchMedicosDisponiveis(); }, [data, hora, editando]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteId || !medicoId || !data || !hora || !sala.trim() || !telefone.trim()) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/agendamento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pacienteId:Number(pacienteId), medicoId:Number(medicoId), data, hora, sala, telefone }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Erro ao criar agendamento!");
        return;
      }

      const novo: Agendamento = await res.json();
      setAgendamentos(editando ? agendamentos.map(a => a.id === editando ? novo : a) : [...agendamentos, novo]);
      alert("✅ Agendamento salvo com sucesso!");
      setPacienteId(""); setMedicoId(""); setData(""); setHora(""); setSala(""); setTelefone(""); setEditando(null);
    } catch (e) {
      console.error(e);
      alert("Erro ao criar agendamento. Tente novamente.");
    }
  };

  const handleEditar = (a: Agendamento) => {
    setPacienteId(a.pacienteId);
    setMedicoId(a.medicoId);
    setData(a.data);
    setHora(a.hora);
    setSala(a.sala);
    setTelefone(a.telefone);
    setEditando(a.id);
  };

  const handleCancelar = (id: number) => {
    setAgendamentos(agendamentos.filter(a => a.id !== id));
  };

  const getUserNome = (id: number, tipo: "paciente" | "medico") => {
    const lista = tipo === "paciente" ? pacientes : medicos;
    return lista.find(u => u.id === id)?.name || "Desconhecido";
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Agendamento de Consultas
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display:"grid", gap:2, mb:4 }}>
        {/* Paciente */}
        <FormControl fullWidth>
          <InputLabel>Paciente</InputLabel>
          <Select value={pacienteId} onChange={e => setPacienteId(e.target.value as number)} label="Paciente" required>
            <MenuItem value=""><em>Selecione um paciente</em></MenuItem>
            {pacientes.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
          </Select>
        </FormControl>

        <TextField label="Telefone de Contato" value={telefone} onChange={e => setTelefone(e.target.value)} required/>
        <TextField label="Data da Consulta" type="date" InputLabelProps={{ shrink:true }} value={data} onChange={e => setData(e.target.value)} required/>

        <FormControl fullWidth>
          <InputLabel>Horário</InputLabel>
          <Select value={hora} onChange={e => setHora(e.target.value)} required>
            <MenuItem value=""><em>Selecione um horário</em></MenuItem>
            {horariosDisponiveis.map(h => <MenuItem key={h} value={h}>{h}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Médico Disponível</InputLabel>
          <Select value={medicoId} onChange={e => setMedicoId(e.target.value as number)} onOpen={fetchMedicosDisponiveis} required>
            <MenuItem value=""><em>Selecione um médico</em></MenuItem>
            {medicos.map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
          </Select>
        </FormControl>

        <TextField label="Sala" value={sala} onChange={e => setSala(e.target.value)} required/>
        <Button type="submit" variant="contained" color={editando ? "success":"primary"}>
          {editando ? "Salvar Alterações" : "Confirmar Agendamento"}
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom>Agendamentos</Typography>
      {agendamentos.length === 0 ? <Typography>Nenhum agendamento registrado ainda.</Typography> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Paciente</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Médico</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Sala</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agendamentos.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{getUserNome(a.pacienteId,"paciente")}</TableCell>
                  <TableCell>{a.telefone}</TableCell>
                  <TableCell>{getUserNome(a.medicoId,"medico")}</TableCell>
                  <TableCell>{a.data}</TableCell>
                  <TableCell>{a.hora}</TableCell>
                  <TableCell>{a.sala}</TableCell>
                  <TableCell>
                    <Button variant="outlined" color="warning" size="small" onClick={() => handleEditar(a)} sx={{mr:1}}>Editar</Button>
                    <Button variant="outlined" color="error" size="small" onClick={() => handleCancelar(a.id)}>Cancelar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
