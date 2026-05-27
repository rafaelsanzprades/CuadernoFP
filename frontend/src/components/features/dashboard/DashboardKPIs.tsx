import React, { useEffect } from "react";
import { Users, CheckCircle, BarChart3, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";

function AnimatedCounter({ value, suffix = "" }: { value: number, suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const display = useTransform(rounded, (v) => `${v}${suffix}`);

  useEffect(() => {
    const animation = animate(count, value, { duration: 2, ease: "easeOut" });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{display}</motion.span>;
}

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
      <Card className="p-6 border-l-4 border-l-blue-500 flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-lg hover:shadow-blue-500/20">
        <div className="p-3 bg-blue-500/20 rounded-lg">
          <Users className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <p className="text-sm text-muted font-semibold">Alumnado</p>
          <p className="text-3xl font-bold text-foreground"><AnimatedCounter value={alumnosCount} /></p>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-[#14a085] flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-lg hover:shadow-[#14a085]/20">
        <div className="p-3 bg-[#14a085]/20 rounded-lg">
          <CheckCircle className="w-8 h-8 text-[#14a085]" />
        </div>
        <div>
          <p className="text-sm text-muted font-semibold">Progreso</p>
          <p className="text-3xl font-bold text-foreground"><AnimatedCounter value={progreso} suffix="%" /></p>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-purple-500 flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-lg hover:shadow-purple-500/20">
        <div className="p-3 bg-purple-500/20 rounded-lg">
          <Clock className="w-8 h-8 text-purple-400" />
        </div>
        <div>
          <p className="text-sm text-muted font-semibold">Impartidas</p>
          <p className="text-3xl font-bold text-foreground">
            <AnimatedCounter value={hImp} /> <span className="text-sm font-normal text-muted">h</span>
          </p>
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-amber-500 flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-lg hover:shadow-amber-500/20">
        <div className="p-3 bg-amber-500/20 rounded-lg">
          <BarChart3 className="w-8 h-8 text-amber-400" />
        </div>
        <div>
          <p className="text-sm text-muted font-semibold">Tareas</p>
          <p className="text-3xl font-bold text-foreground"><AnimatedCounter value={tareasCount} /></p>
        </div>
      </Card>
    </div>
  );
}
