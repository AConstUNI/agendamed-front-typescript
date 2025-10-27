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
}

interface User {
  id: number;
  name: string;
  role: string;
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
  const [pacientes, setPacientes] = useState<User[]>([]);
  const [medicos, setMedicos] = useState<User[]>([]);

  // 🔹 Buscar usuários da API
  const fetchUsers = async () => {
    if (!process.env.NEXT_PUBLIC_API_LINK) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/users/all`);
      if (!response.ok) return;

      const data = await response.json();

      // Separa pacientes e médicos
      const filteredPacientes = data.filter(
        (user: User) => user.role?.toLowerCase() === "user"
      );
      const filteredMedicos = data.filter(
        (user: User) =>
          user.role?.toLowerCase() === "doctor" || user.role?.toLowerCase() === "medico"
      );

      setPacientes(filteredPacientes);
      setMedicos(filteredMedicos);
    } catch (e) {
      console.error("Erro ao buscar usuários:", e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pacienteId || !medicoId) {
      alert("Selecione paciente e médico antes de confirmar.");
      return;
    }

    if (!telefone.trim()) {
      alert("Informe o telefone de contato do paciente.");
      return;
    }

    if (!hora) {
      alert("Informe o horário do atendimento.");
      return;
    }

    if (!data) {
      alert("Informe a data do atendimento.");
      return;
    }

    if (!sala.trim()) {
      alert("Informe a sala do atendimento.");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/users/agenda`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pacienteId: Number(pacienteId),
          medicoId: Number(medicoId),
          data,
          hora,
          sala,
          telefone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Erro ao criar agendamento!");
        return;
      }

      const novoAgendamento = await response.json();

      setAgendamentos([...agendamentos, novoAgendamento]);
      alert("✅ Agendamento criado com sucesso!");

      // Resetar campos
      setPacienteId("");
      setMedicoId("");
      setData("");
      setHora("");
      setSala("");
      setTelefone("");
      setEditando(null);
    } catch (error) {
      console.error(error);
      alert("Erro ao criar agendamento. Tente novamente.");
    }
  };


  const handleCancelar = (id: number) => {
    setAgendamentos(agendamentos.filter((a) => a.id !== id));
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

  const getUserNome = (id: number, tipo: "paciente" | "medico") => {
    const lista = tipo === "paciente" ? pacientes : medicos;
    return lista.find((u) => u.id === id)?.name || "Desconhecido";
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Agendamento de Consultas
      </Typography>

      {/* 🔹 Formulário */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "grid", gap: 2, mb: 4 }}
      >
        {/* Paciente */}
        <FormControl fullWidth>
          <InputLabel>Paciente</InputLabel>
          <Select
            value={pacienteId}
            onChange={(e) => setPacienteId(e.target.value as number)}
            label="Paciente"
            required
          >
            <MenuItem value="">
              <em>Selecione um paciente</em>
            </MenuItem>
            {pacientes.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Telefone */}
        <TextField
          label="Telefone de Contato"
          placeholder="(11) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          required
        />

        {/* Médico */}
        <FormControl fullWidth>
          <InputLabel>Médico</InputLabel>
          <Select
            value={medicoId}
            onChange={(e) => setMedicoId(e.target.value as number)}
            label="Médico"
            required
          >
            <MenuItem value="">
              <em>Selecione um médico</em>
            </MenuItem>
            {medicos.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Data */}
        <TextField
          label="Data da Consulta"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
        />

        {/* Hora */}
        <TextField
          label="Horário do Atendimento"
          type="time"
          InputLabelProps={{ shrink: true }}
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          required
        />

        {/* Sala */}
        <TextField
          label="Sala"
          value={sala}
          onChange={(e) => setSala(e.target.value)}
          required
        />

        {/* Botão */}
        <Button
          type="submit"
          variant="contained"
          color={editando ? "success" : "primary"}
        >
          {editando ? "Salvar Alterações" : "Confirmar Agendamento"}
        </Button>
      </Box>

      {/* 🔹 Lista de Agendamentos */}
      <Typography variant="h5" gutterBottom>
        Agendamentos
      </Typography>

      {agendamentos.length === 0 ? (
        <Typography>Nenhum agendamento registrado ainda.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Paciente</b></TableCell>
                <TableCell><b>Telefone</b></TableCell>
                <TableCell><b>Médico</b></TableCell>
                <TableCell><b>Data</b></TableCell>
                <TableCell><b>Hora</b></TableCell>
                <TableCell><b>Sala</b></TableCell>
                <TableCell><b>Ações</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agendamentos.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{getUserNome(a.pacienteId, "paciente")}</TableCell>
                  <TableCell>{a.telefone}</TableCell>
                  <TableCell>{getUserNome(a.medicoId, "medico")}</TableCell>
                  <TableCell>{a.data}</TableCell>
                  <TableCell>{a.hora}</TableCell>
                  <TableCell>{a.sala}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      onClick={() => handleEditar(a)}
                      sx={{ mr: 1 }}
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
