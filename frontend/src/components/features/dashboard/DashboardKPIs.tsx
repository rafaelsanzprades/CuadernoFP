import React from "react";
import { Users, CheckCircle, BarChart3, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface DashboardKPIsProps {
  cursoData: any;
  moduleData: any;
}

export function DashboardKPIs({ cursoData, moduleData }: DashboardKPIsProps) {
  const alumnosCount = cursoData?.df_al?.length || 0;
  
  const sgmtData = cursoData?.df_sgmt || [];
  let hPlan = 0; 
  let hImp = 0;
  sgmtData.forEach((ud: any) => { 
    hPlan += Number(ud.horas_ud || 0); 
    hImp += Number(ud.Total_Imp || 0); 
  });
  const progreso = hPlan > 0 ? Math.round((hImp / hPlan) * 100) : 0;
  
  const tareasCount = moduleData?.df_tareas?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="p-6 border-l-4 border-l-blue-500 flex items-center gap-4">
        <div className="p-3 bg-blue-500/20 rounded-lg">
          <Users className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400 font-semibold">Alumnado</p>
          <p className="text-3xl font-bold text-white">{alumnosCount}</p>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-[#14a085] flex items-center gap-4">
        <div className="p-3 bg-[#14a085]/20 rounded-lg">
          <CheckCircle className="w-8 h-8 text-[#14a085]" />
        </div>
        <div>
          <p className="text-sm text-gray-400 font-semibold">Progreso</p>
          <p className="text-3xl font-bold text-white">{progreso}%</p>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-purple-500 flex items-center gap-4">
        <div className="p-3 bg-purple-500/20 rounded-lg">
          <Clock className="w-8 h-8 text-purple-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400 font-semibold">Impartidas</p>
          <p className="text-3xl font-bold text-white">
            {hImp} <span className="text-sm font-normal text-gray-400">h</span>
          </p>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-amber-500 flex items-center gap-4">
        <div className="p-3 bg-amber-500/20 rounded-lg">
          <BarChart3 className="w-8 h-8 text-amber-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400 font-semibold">Tareas</p>
          <p className="text-3xl font-bold text-white">{tareasCount}</p>
        </div>
      </Card>
    </div>
  );
}
