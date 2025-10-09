import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Plus, Calendar, Users, Clock, BarChart3 } from "lucide-react";

interface QuickActionsProps {
  onNewAgendamento: () => void;
  totalAgendamentos: number;
  agendamentosHoje: number;
}

const QuickActions = ({ onNewAgendamento, totalAgendamentos, agendamentosHoje }: QuickActionsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="medical-card bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-glow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-medium">Consultas Hoje</p>
              <p className="text-3xl font-bold">{agendamentosHoje}</p>
              <p className="text-xs opacity-80 mt-1">Próximas 24h</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Calendar className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="medical-card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-medium">Total Agendado</p>
              <p className="text-3xl font-bold">{totalAgendamentos}</p>
              <p className="text-xs opacity-80 mt-1">Consultas ativas</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Users className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="medical-card bg-gradient-to-br from-amber-500 to-orange-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-medium">Próxima Consulta</p>
              <p className="text-2xl font-bold">08:30</p>
              <p className="text-xs opacity-80 mt-1">João Silva - Cardiologia</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Clock className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="medical-card group hover:shadow-glow">
        <CardContent className="p-6">
          <Button 
            onClick={onNewAgendamento} 
            className="w-full h-full flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 border-0 text-white"
          >
            <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <Plus className="h-8 w-8" />
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold">Nova Consulta</div>
              <div className="text-xs opacity-90">Agendar paciente</div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActions;