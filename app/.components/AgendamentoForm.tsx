"use client"

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "../.lib/utils";
import { useToast } from "../.hooks/use-toast";

interface AgendamentoFormProps {
  onSubmit: (agendamento: any) => void;
  agendamentoEdit?: any;
  onCancel: () => void;
}

const AgendamentoForm = ({ onSubmit, agendamentoEdit, onCancel }: AgendamentoFormProps) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(agendamentoEdit?.data);

  const medicos = [
    { id: "1", nome: "Dr. João Silva", especialidade: "Cardiologia" },
    { id: "2", nome: "Dra. Ana Santos", especialidade: "Dermatologia" },
    { id: "3", nome: "Dr. Carlos Lima", especialidade: "Ortopedia" },
    { id: "4", nome: "Dra. Maria Costa", especialidade: "Pediatria" }
  ];

  // Função para encontrar ID do médico pelo nome (para edição)
  const getMedicoIdByName = (nomeCompleto: string) => {
    const medico = medicos.find(m => m.nome === nomeCompleto);
    return medico ? medico.id : "";
  };

  const [formData, setFormData] = useState({
    paciente: agendamentoEdit?.paciente || "",
    telefone: agendamentoEdit?.telefone || "",
    medico: agendamentoEdit?.medico ? getMedicoIdByName(agendamentoEdit.medico) : "",
    especialidade: agendamentoEdit?.especialidade || "",
    horario: agendamentoEdit?.horario || "",
    observacoes: agendamentoEdit?.observacoes || ""
  });

  const horarios = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !formData.paciente || !formData.medico || !formData.horario) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const novoAgendamento = {
      id: agendamentoEdit?.id || Date.now().toString(),
      ...formData,
      medico: medicos.find(m => m.id === formData.medico)?.nome || formData.medico, // Salva o nome do médico
      data: date,
      status: agendamentoEdit?.status || "agendado"
    };

    onSubmit(novoAgendamento);
    
    toast({
      title: agendamentoEdit ? "Consulta atualizada" : "Consulta agendada",
      description: `Consulta ${agendamentoEdit ? 'atualizada' : 'agendada'} com sucesso para ${formData.paciente}`,
      className: "bg-success text-success-foreground"
    });
  };

  const medicoSelecionado = medicos.find(m => m.id === formData.medico);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="medical-card">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-50 rounded-t-lg">
          <CardTitle className="flex items-center space-x-3 text-primary">
            <div className="bg-primary/10 p-2 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-xl">{agendamentoEdit ? "Editar Consulta" : "Nova Consulta"}</span>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                {agendamentoEdit ? "Modifique as informações da consulta" : "Preencha os dados para agendar uma nova consulta"}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="paciente">Nome do Paciente *</Label>
                <Input
                  id="paciente"
                  value={formData.paciente}
                  onChange={(e) => setFormData({...formData, paciente: e.target.value})}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Médico *</Label>
                <Select value={formData.medico} onValueChange={(value) => {
                  const medico = medicos.find(m => m.id === value);
                  setFormData({
                    ...formData, 
                    medico: value,
                    especialidade: medico?.especialidade || ""
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicos.map((medico) => (
                      <SelectItem key={medico.id} value={medico.id}>
                        {medico.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Especialidade</Label>
                <Input
                  value={medicoSelecionado?.especialidade || ""}
                  disabled
                  placeholder="Selecionado automaticamente"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data da Consulta *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[1100]" align="start" side="bottom" sideOffset={8}>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0}
                      initialFocus
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Horário *</Label>
                <Select value={formData.horario} onValueChange={(value) => setFormData({...formData, horario: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {horarios.map((horario) => (
                      <SelectItem key={horario} value={horario}>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {horario}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                placeholder="Observações adicionais sobre a consulta..."
                rows={3}
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" className="flex-1">
                {agendamentoEdit ? "Atualizar Consulta" : "Agendar Consulta"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendamentoForm;
