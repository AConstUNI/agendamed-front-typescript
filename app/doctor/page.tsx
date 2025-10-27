"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { getUserSession } from "../.lib/auth";

interface Agendamento {
  id: number;
  pacienteId: number;
  medicoId: number;
  data: string;
  hora: string;
  sala: string;
  telefone: string;
  status?: string; // "agendado" | "realizada" | "desmarcada"
  paciente?: { id: number; name: string };
  medico?: { id: number; name: string; specialty: string };
}

export default function AgendamentoMedicoPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [medicoId, setMedicoId] = useState<number | null>(null);

  const fetchAgendamentosMedico = async () => {
    console.log("fetchAgendamentosMedico disparado");

    // Pegando JWT do sessionStorage
    const jwt = sessionStorage.getItem("jwtToken");
    if (!jwt) {
      console.log("Nenhum JWT encontrado no sessionStorage");
      return;
    }

    const user = await getUserSession(jwt);
    if (!user) {
      console.log("Usuário não retornou do /me");
      return;
    }

    console.log("Usuário logado:", user);
    setMedicoId(user.id);

    const url = `${process.env.NEXT_PUBLIC_API_LINK}/agendamento/filtro?medicoId=${user.id}`;
    console.log("Fetch para URL:", url);

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: "no-store", // evita cache 304
      });

      console.log("Response fetch:", res);

      if (!res.ok) {
        console.error("Erro ao buscar agendamentos:", res.status, res.statusText);
        return;
      }

      const data: Agendamento[] = await res.json();
      setAgendamentos(data);
    } catch (e) {
      console.error("Erro ao buscar agendamentos:", e);
    }
  };

  useEffect(() => {
    fetchAgendamentosMedico();
  }, []);

  const atualizarStatus = async (id: number, status: "realizada" | "desmarcada") => {
    const jwt = sessionStorage.getItem("jwt");
    if (!jwt) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/agendamento/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Erro ao atualizar status!");
        return;
      }

      setAgendamentos((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } catch (e) {
      console.error(e);
      alert("Erro ao atualizar status. Tente novamente.");
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Meus Agendamentos
      </Typography>

      {agendamentos.length === 0 ? (
        <Typography>Nenhum agendamento registrado ainda.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Paciente</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Sala</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agendamentos.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{a.paciente?.name || "Desconhecido"}</TableCell>
                  <TableCell>{a.telefone}</TableCell>
                  <TableCell>{a.data}</TableCell>
                  <TableCell>{a.hora}</TableCell>
                  <TableCell>{a.sala}</TableCell>
                  <TableCell>{a.status || "agendado"}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => atualizarStatus(a.id, "realizada")}
                      disabled={a.status === "realizada"}
                    >
                      Consulta Realizada
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => atualizarStatus(a.id, "desmarcada")}
                      disabled={a.status === "desmarcada"}
                    >
                      Consulta Desmarcada
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
