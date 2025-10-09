"use client"

import { useState } from "react";
import AgendamentoForm from "../../.components/AgendamentoForm";
import AgendaCalendar from "../../.components/AgendaCalendar";
import QuickActions from "../../.components/QuickActions";
import { isToday } from "date-fns";

interface Agendamento {
  id: string;
  paciente: string;
  telefone: string;
  medico: string;
  especialidade: string;
  data: Date;
  horario: string;
  observacoes: string;
  status: "agendado" | "cancelado" | "realizado";
}

export default function ShedulingPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([
    {
      id: "1",
      paciente: "João Silva",
      telefone: "(11) 99999-1234",
      medico: "Dr. João Silva",
      especialidade: "Cardiologia",
      data: new Date(),
      horario: "09:00",
      observacoes: "Primeira consulta",
      status: "agendado"
    },
    {
      id: "2",
      paciente: "Maria Santos",
      telefone: "(11) 99999-5678",
      medico: "Dra. Ana Santos",
      especialidade: "Dermatologia",
      data: new Date(),
      horario: "10:30",
      observacoes: "",
      status: "agendado"
    }
  ]);

  const handleNewAgendamento = () => {
    setEditingAgendamento(null);
    setShowForm(true);
  };

  const handleEditAgendamento = (agendamento: Agendamento) => {
    setEditingAgendamento(agendamento);
    setShowForm(true);
  };

  const handleRescheduleAgendamento = (agendamento: Agendamento) => {
    setEditingAgendamento(agendamento);
    setShowForm(true);
  };

  const handleSubmitAgendamento = (agendamentoData: Agendamento) => {
    if (editingAgendamento) {
      setAgendamentos(prev => 
        prev.map(ag => ag.id === editingAgendamento.id ? agendamentoData : ag)
      );
    } else {
      setAgendamentos(prev => [...prev, agendamentoData]);
    }
    setShowForm(false);
    setEditingAgendamento(null);
  };

  const handleDeleteAgendamento = (id: string) => {
    setAgendamentos(prev => prev.filter(ag => ag.id !== id));
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAgendamento(null);
  };

  const agendamentosHoje = agendamentos.filter(ag => isToday(ag.data) && ag.status === "agendado").length;

  return (
    <div className="min-h-screen bg-background">      
      <main className="container mx-auto px-6 py-6">
        {showForm ? (
          <AgendamentoForm
            onSubmit={handleSubmitAgendamento}
            agendamentoEdit={editingAgendamento}
            onCancel={handleCancelForm}
          />
        ) : (
          <>
            <QuickActions
              onNewAgendamento={handleNewAgendamento}
              totalAgendamentos={agendamentos.filter(ag => ag.status === "agendado").length}
              agendamentosHoje={agendamentosHoje}
            />
            
            <AgendaCalendar
              agendamentos={agendamentos}
              onEdit={handleEditAgendamento}
              onDelete={handleDeleteAgendamento}
              onReschedule={handleRescheduleAgendamento}
            />
          </>
        )}
      </main>
    </div>
  );
};
