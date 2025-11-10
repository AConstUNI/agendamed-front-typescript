"use client";

import { useState, useEffect, forwardRef } from "react";
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
  Autocomplete,
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
    const agora = new Date();
    const today = agora.toISOString().split("T")[0];

    if (data > today) return horariosDisponiveis;
    if (data === today) {
      const horaAtual = `${agora.getHours()}`.padStart(2, "0") + ":" + `${agora.getMinutes()}`.padStart(2, "0");
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
      console.error("Erro ao buscar pacientes:", e);
    }
  };

  const fetchAgendamentos = async () => {
    const jwt = sessionStorage.getItem("jwtToken");
    if (!jwt) return;

    const user = await getUserSession(jwt);
    if (!user) return;
    setPacienteId(user.id);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/agendamento/filtro?pacienteId=${user.id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: "no-store",
      });
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/agendamento/disponiveis?data=${data}&hora=${hora}`);
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
            name: `${ag.medico.user.name} - ${ag.medico.specialty}`,
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
    if (!medicoId || !data || !hora || !telefone.trim()) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      const user = await getUserSession(sessionStorage.getItem("jwtToken") || '')

      if (editando) {
        alert('Para editar a consulta é preciso excluir ela')
        const _ = await handleCancelar(editando)
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/agendamento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pacienteId: Number(pacienteId),
          medicoId: Number(medicoId),
          data,
          hora,
          sala: 'Volte mais tarde',
          telefone,
          who: user.email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Erro ao criar agendamento!");
        return;
      }
      await fetchAgendamentos(); // refresh the table from backend

      alert("✅ Agendamento salvo com sucesso!");

      setMedicoId(""); setData(""); setHora(""); setTelefone(""); setEditando(null); setMedicoInput("");

    } catch (e) {
      console.error(e);
      alert("Erro ao criar agendamento. Tente novamente.");
    }
  };

  const handleEditar = (a: Agendamento) => {
    setMedicoId(a.medicoId);
    setData(a.data);
    setHora(a.hora);
    setTelefone(a.telefone);
    setEditando(a.id);
    setMedicoInput(a.medico?.user?.name || "");
  };

  // Cancela (deleta) agendamento
  const handleCancelar = async (id: number) => {
    if (!confirm("Deseja realmente cancelar este agendamento?")) return;
    try {
      const user = await getUserSession(sessionStorage.getItem("jwtToken") || '')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/agendamento/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ who: user.email }),
      });

      if (!res.ok) throw new Error("Erro ao cancelar agendamento");
      setAgendamentos(agendamentos.filter(a => a.id !== id));
      alert("❌ Agendamento cancelado com sucesso.");
    } catch (e) {
      console.error(e);
      alert("Erro ao cancelar agendamento.");
    }
  };

  const getUserNome = (id: number, tipo: "paciente" | "medico") => {
    const lista = tipo === "paciente" ? pacientes : medicos;
    return lista.find(u => u.id === id)?.name || "Desconhecido";
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'grey.200' }}>
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
          {agendamentos.map((a, i) => (
            <TableRow
              key={a.id}
              sx={{
                backgroundColor: i % 2 ? 'grey.50' : 'white',
                "&:hover": { backgroundColor: 'action.hover' },
              }}
            >
              <TableCell>{a.id}</TableCell>
              <TableCell>{getUserNome(a.pacienteId, "paciente")}</TableCell>
              <TableCell>{a.telefone}</TableCell>
              <TableCell>{a.medico?.user?.name}</TableCell>
              <TableCell>{a.data}</TableCell>
              <TableCell>{a.hora}</TableCell>
              <TableCell>{a.sala}</TableCell>
              <TableCell sx={{ display: 'flex', gap: 1 }}>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
