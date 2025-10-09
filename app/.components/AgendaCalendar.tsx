"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Phone, Edit2, Trash2, RotateCcw } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useToast } from "../.hooks/use-toast";

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

interface AgendaCalendarProps {
  agendamentos: Agendamento[];
  onEdit: (agendamento: Agendamento) => void;
  onDelete: (id: string) => void;
  onReschedule: (agendamento: Agendamento) => void;
}

const AgendaCalendar = ({ agendamentos, onEdit, onDelete, onReschedule }: AgendaCalendarProps) => {
  const { toast } = useToast();
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; agendamento?: Agendamento }>({ open: false });

  // Lista dos médicos para converter ID em nome
  const medicos = [
    { id: "1", nome: "Dr. João Silva", especialidade: "Cardiologia" },
    { id: "2", nome: "Dra. Ana Santos", especialidade: "Dermatologia" },
    { id: "3", nome: "Dr. Carlos Lima", especialidade: "Ortopedia" },
    { id: "4", nome: "Dra. Maria Costa", especialidade: "Pediatria" }
  ];

  // Função para obter nome do médico pelo ID
  const getNomeMedico = (medicoId: string) => {
    const medico = medicos.find(m => m.id === medicoId);
    return medico ? medico.nome : medicoId; // Retorna o nome ou o ID caso não encontre
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const getAgendamentosForDay = (date: Date) => {
    return agendamentos.filter(ag => isSameDay(ag.data, date)).sort((a, b) => a.horario.localeCompare(b.horario));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado": return "bg-primary text-primary-foreground";
      case "cancelado": return "bg-destructive text-destructive-foreground";
      case "realizado": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleDelete = (agendamento: Agendamento) => {
    setDeleteDialog({ open: true, agendamento });
  };

  const confirmDelete = () => {
    if (deleteDialog.agendamento) {
      onDelete(deleteDialog.agendamento.id);
      toast({
        title: "Consulta cancelada",
        description: `Consulta de ${deleteDialog.agendamento.paciente} foi cancelada com sucesso.`,
        className: "bg-destructive text-destructive-foreground"
      });
    }
    setDeleteDialog({ open: false });
  };

  return (
    <div className="space-y-6">
      <Card className="medical-card">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-lg">Agenda Semanal</span>
                <p className="text-sm text-muted-foreground font-normal">Visualização completa da semana</p>
              </div>
            </CardTitle>
            <div className="flex items-center space-x-3 bg-white rounded-lg p-2 shadow-sm">
              <Button variant="outline" size="sm" onClick={() => setCurrentWeek(addDays(currentWeek, -7))} className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center px-3">
                <div className="text-sm font-semibold text-foreground">
                  {format(currentWeek, "d MMM", { locale: ptBR })} - {format(addDays(currentWeek, 6), "d MMM yyyy", { locale: ptBR })}
                </div>
                <div className="text-xs text-muted-foreground">Semana atual</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentWeek(addDays(currentWeek, 7))} className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day, index) => {
              const agendamentosDay = getAgendamentosForDay(day);
              const dayName = format(day, "EEE", { locale: ptBR });
              const dayNumber = format(day, "d");
              
              return (
                <div key={index} className="min-h-[320px] border border-border/50 rounded-xl p-3 bg-gradient-to-b from-white to-slate-50/50">
                  <div className={`text-center p-3 rounded-lg mb-3 font-medium ${
                    isToday(day) 
                      ? 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg' 
                      : 'bg-gradient-to-br from-slate-100 to-slate-200 text-foreground'
                  }`}>
                    <div className="text-xs uppercase tracking-wide opacity-90">{dayName}</div>
                    <div className="text-lg font-bold">{dayNumber}</div>
                  </div>
                  
                  <div className="space-y-2">
                    {agendamentosDay.map((agendamento) => (
                      <div key={agendamento.id} className="medical-card p-3 text-xs bg-white border-l-4 border-l-primary/30">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`status-badge text-xs px-2 py-1 ${getStatusColor(agendamento.status)}`}>
                            {agendamento.status === 'agendado' ? 'Agendado' : 
                             agendamento.status === 'cancelado' ? 'Cancelado' : 'Realizado'}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(agendamento)}
                              className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onReschedule(agendamento)}
                              className="h-7 w-7 p-0 hover:bg-warning/10 hover:text-warning"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(agendamento)}
                              className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 mb-2 bg-slate-50 rounded px-2 py-1">
                          <Clock className="h-3 w-3 text-primary" />
                          <span className="font-semibold text-primary">{agendamento.horario}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 mb-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium truncate text-foreground">{agendamento.paciente}</span>
                        </div>
                        
                        <div className="text-muted-foreground truncate text-xs mb-1">
                          <span className="font-medium">{getNomeMedico(agendamento.medico)}</span>
                        </div>
                        
                        <div className="text-muted-foreground truncate text-xs bg-accent/50 rounded px-1 py-0.5">
                          {agendamento.especialidade}
                        </div>
                        
                        {agendamento.telefone && (
                          <div className="flex items-center space-x-1 mt-2 pt-2 border-t border-border/30">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground text-xs">{agendamento.telefone}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {agendamentosDay.length === 0 && (
                      <div className="text-center text-muted-foreground text-xs py-8 bg-slate-50/50 rounded-lg border-2 border-dashed border-border/30">
                        <Calendar className="h-6 w-6 mx-auto mb-2 opacity-30" />
                        <div>Nenhuma consulta</div>
                        <div className="text-xs opacity-70">agendada</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Consulta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar a consulta de {deleteDialog.agendamento?.paciente}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter consulta</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancelar consulta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AgendaCalendar;
