"use client"

import { useState } from "react";
import { Calendar, Clock, User, Settings, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useToast } from "../.hooks/use-toast";

const atendentes = [
  { id: "1", nome: "Maria Silva", cargo: "Atendente Senior" },
  { id: "2", nome: "João Santos", cargo: "Atendente" },
  { id: "3", nome: "Ana Costa", cargo: "Recepcionista" },
  { id: "4", nome: "Carlos Lima", cargo: "Atendente" }
];

const AgendaHeader = () => {
  const { toast } = useToast();
  const [atendenteAtual, setAtendenteAtual] = useState(atendentes[0]);

  const handleChangeAtendente = (atendente: typeof atendentes[0]) => {
    setAtendenteAtual(atendente);
    toast({
      title: "Atendente alterado",
      description: `Você está agora logado como ${atendente.nome}`,
      className: "bg-success text-success-foreground"
    });
  };

  return (
    <header className="medical-header px-6 py-4 border-b border-border/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-foreground/20 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Sistema de Gestão Médica</h1>
              <p className="text-sm text-primary-foreground/80">Gerenciamento de consultas médicas</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-sm text-primary-foreground/80 bg-primary-foreground/10 px-3 py-2 rounded-lg">
            <Clock className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="bg-primary-foreground/20 p-1.5 rounded-full">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{atendenteAtual.nome}</div>
                    <div className="text-xs text-primary-foreground/70">{atendenteAtual.cargo}</div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 dropdown-content">
              {atendentes.map((atendente) => (
                <DropdownMenuItem
                  key={atendente.id}
                  onClick={() => handleChangeAtendente(atendente)}
                  className={`flex items-center space-x-3 cursor-pointer ${
                    atendenteAtual.id === atendente.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="bg-primary/10 p-1.5 rounded-full">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{atendente.nome}</div>
                    <div className="text-xs text-muted-foreground">{atendente.cargo}</div>
                  </div>
                  {atendenteAtual.id === atendente.id && (
                    <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AgendaHeader;