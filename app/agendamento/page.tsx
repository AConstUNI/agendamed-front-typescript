"use client";

import { useState } from "react";
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
  data: string;
  sala: string;
  inicio: string;
  fim: string;
}

const pacientes = [
  { id: 1, nome: "Ana Silva" },
  { id: 2, nome: "Carlos Pereira" },
  { id: 3, nome: "Mariana Costa" },
  { id: 4, nome: "João Oliveira" },
];

export default function AgendamentoPage() {
  const [pacienteId, setPacienteId] = useState<number | "">("");
  const [data, setData] = useState("");
  const [sala, setSala] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [editando, setEditando] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pacienteId) {
      alert("Selecione um paciente antes de confirmar.");
      return;
    }

    if (editando !== null) {
      setAgendamentos(
        agendamentos.map((a) =>
          a.id === editando ? { ...a, pacienteId, data, sala, inicio, fim } : a
        )
      );
      setEditando(null);
      alert("✅ Agendamento atualizado!");
    } else {
      const novo: Agendamento = {
        id: Date.now(),
        pacienteId: Number(pacienteId),
        data,
        sala,
        inicio,
        fim,
      };

      // Verifica conflito
      const conflito = agendamentos.find(
        (a) =>
          a.sala === sala &&
          a.data === data &&
          ((inicio >= a.inicio && inicio < a.fim) ||
            (fim > a.inicio && fim <= a.fim))
      );

      if (conflito) {
        alert("⚠️ Conflito de horário! Sala já ocupada.");
        return;
      }

      setAgendamentos([...agendamentos, novo]);
      alert("✅ Agendamento criado com sucesso!");
    }

    setPacienteId("");
    setData("");
    setSala("");
    setInicio("");
    setFim("");
  };

  const handleCancelar = (id: number) => {
    setAgendamentos(agendamentos.filter((a) => a.id !== id));
  };

  const handleEditar = (a: Agendamento) => {
    setPacienteId(a.pacienteId);
    setData(a.data);
    setSala(a.sala);
    setInicio(a.inicio);
    setFim(a.fim);
    setEditando(a.id);
  };

  const getPacienteNome = (id: number) =>
    pacientes.find((p) => p.id === id)?.nome || "Desconhecido";

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Agendamento de Consultas
      </Typography>

      {/* Formulário */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "grid", gap: 2, mb: 4 }}
      >
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
                {p.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Data"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
        />
        <TextField
          label="Sala"
          value={sala}
          onChange={(e) => setSala(e.target.value)}
          required
        />
        <TextField
          label="Início"
          type="time"
          InputLabelProps={{ shrink: true }}
          value={inicio}
          onChange={(e) => setInicio(e.target.value)}
          required
        />
        <TextField
          label="Fim"
          type="time"
          InputLabelProps={{ shrink: true }}
          value={fim}
          onChange={(e) => setFim(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="contained"
          color={editando ? "success" : "primary"}
        >
          {editando ? "Salvar Alterações" : "Confirmar Agendamento"}
        </Button>
      </Box>

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
                <TableCell><b>ID da Consulta</b></TableCell>
                <TableCell><b>Paciente</b></TableCell>
                <TableCell><b>Data</b></TableCell>
                <TableCell><b>Sala</b></TableCell>
                <TableCell><b>Início</b></TableCell>
                <TableCell><b>Fim</b></TableCell>
                <TableCell><b>Ações</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agendamentos.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{getPacienteNome(a.pacienteId)}</TableCell>
                  <TableCell>{a.data}</TableCell>
                  <TableCell>{a.sala}</TableCell>
                  <TableCell>{a.inicio}</TableCell>
                  <TableCell>{a.fim}</TableCell>
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
