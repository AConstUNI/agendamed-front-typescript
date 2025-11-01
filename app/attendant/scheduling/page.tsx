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
  const [sala, setSala] = useState("");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);

  // Horários fixos possíveis
  const horariosDisponiveis = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  // Restringe para datas futuras
  const getMinDate = () => {
    const hoje = new Date();
    hoje.setDate(hoje.getDate());
    return hoje.toISOString().split("T")[0];
  };

  // Retorna horários disponíveis (sem horários passados se for hoje)
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

  // Busca todos os pacientes
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

  // Busca todos os agendamentos
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

  // Busca médicos disponíveis para a data e hora selecionadas
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

      // Mantém o médico do agendamento ao editar
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
      console.error("Erro ao buscar médicos:", e);
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

  // Criar ou editar agendamento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteId || !medicoId || !data || !hora || !sala.trim() || !telefone.trim()) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      const user = await getUserSession(sessionStorage.getItem("jwtToken") || '')

      const body = {
        pacienteId: Number(pacienteId),
        medicoId: Number(medicoId),
        data,
        hora,
        sala,
        telefone,
        who: user.email,
      };

      const method = "POST";
      const url = `${process.env.NEXT_PUBLIC_API_LINK}/agendamento`;

      

      if (editando) {
        alert('Para editar a consulta é preciso excluir ela')
        const _ = await handleCancelar(editando)
      } 

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Erro ao salvar agendamento!");
        return;
      }

      await fetchAgendamentos();
      alert("✅ Agendamento salvo com sucesso!");

      // Limpar campos
      setPacienteId("");
      setMedicoId("");
      setData("");
      setHora("");
      setTelefone("");
      setSala("");
      setMedicoInput("");
      setEditando(null);
    } catch (e) {
      console.error(e);
      alert("Erro ao criar agendamento. Tente novamente.");
    }
  };

  // Preenche dados ao editar
  const handleEditar = (a: Agendamento) => {
    setPacienteId(a.pacienteId);
    setMedicoId(a.medicoId);
    setData(a.data);
    setHora(a.hora);
    setSala(a.sala);
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

  // ==================== JSX ====================
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Agendamento de Consultas
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2, mb: 4 }}>
        {/* Paciente */}
        <FormControl fullWidth>
          <InputLabel id='label-paciente'>Paciente</InputLabel>
          <Select
            labelId="label-paciente"
            value={pacienteId}
            onChange={e => setPacienteId(e.target.value as number)}
            label='Pacient'
            required
          >
            <MenuItem value=""><em>Selecione um paciente</em></MenuItem>
            {pacientes.map(p => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Phone with mask */}
        <TextField
          label="Telefone de Contato"
          fullWidth
          name="phone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          InputProps={{
            inputComponent: PhoneMaskCustom as any,
          }}
        />

        <TextField
          label="Data da Consulta"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={data}
          onChange={e => setData(e.target.value)}
          inputProps={{ min: getMinDate() }}
          required
        />

        <FormControl fullWidth>
          <InputLabel id="horario-label">Horário</InputLabel>
          <Select labelId="horario-label" value={hora} onChange={e => setHora(e.target.value)} label="Horár" required>
            <MenuItem value=""><em>Selecione um horário</em></MenuItem>
            {getHorariosDisponiveis().map(h => (
              <MenuItem key={h} value={h}>{h}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Médico com autocomplete */}
        <Autocomplete
          options={medicos}
          getOptionLabel={(option) => option.name}
          value={medicos.find(m => m.id === medicoId) || null}
          inputValue={medicoInput}
          onInputChange={(e, newInput) => setMedicoInput(newInput)}
          onChange={(e, newValue) => setMedicoId(newValue ? newValue.id : "")}
          renderInput={(params) => <TextField {...params} label="Médico Disponível" required />}
        />

        <TextField
          label="Sala"
          value={sala}
          onChange={e => setSala(e.target.value)}
          required
        />

        <Button type="submit" variant="contained" color={editando ? "success" : "primary"}>
          {editando ? "Salvar Alterações" : "Confirmar Agendamento"}
        </Button>
      </Box>

      {/* Tabela de agendamentos */}
      <Typography variant="h5" gutterBottom>Todos os Agendamentos</Typography>
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
                  <TableCell>{getUserNome(a.pacienteId, "paciente")}</TableCell>
                  <TableCell>{a.telefone}</TableCell>
                  <TableCell>{a.medico?.user?.name}</TableCell>
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
