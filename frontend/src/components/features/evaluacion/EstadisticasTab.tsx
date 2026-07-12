"use client";
import React, { useState } from "react";

import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { BarChart3, PieChart, TrendingUp, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend } from "recharts";

export default function EstadisticasTab() {
  const { cursoData, moduleData, activeCursoId } = useAppStore();
  const [evalPeriod, setEvalPeriod] = useState<"1T" | "2T" | "3T" | "FINAL">("FINAL");

  // Si no hay datos, mostrar aviso
  if (!activeCursoId) {
    return (
      <div className="p-12 text-center bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
        <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-bold">No hay curso activo</h2>
        <p className="text-muted">Abre un archivo de curso para ver sus estadísticas.</p>
      </div>
    );
  }

  // Preparar datos
  const df_eval = cursoData?.df_eval || [];
  const df_al = cursoData?.df_al || [];
  const df_ra = moduleData?.df_ra || [];

  const alumnosIds = df_al.filter(al => al.Estado === "Matriculado").map(a => a.ID);
  
  // Rendimiento Global (% Aprobados vs Suspensos)
  const getGlobalStats = () => {
    let aprobados = 0;
    let suspensos = 0;
    
    alumnosIds.forEach(id => {
      // Find row for this student
      const row = df_eval.find(r => r.ID === id);
      if (row) {
        let notaStr = "0";
        if (evalPeriod === "1T") notaStr = row.Nota_1T;
        else if (evalPeriod === "2T") notaStr = row.Nota_2T;
        else if (evalPeriod === "3T") notaStr = row.Nota_3T;
        else notaStr = row.Nota_Final;

        const notaNum = parseFloat(notaStr);
        if (!isNaN(notaNum)) {
          if (notaNum >= 5) aprobados++;
          else suspensos++;
        }
      }
    });

    return [
      { name: "Aprobados", value: aprobados, color: "#10b981" },
      { name: "Suspensos", value: suspensos, color: "#f43f5e" }
    ];
  };

  const globalStats = getGlobalStats();

  // Media por RA
  const getRaStats = () => {
    return df_ra.map(ra => {
      let sum = 0;
      let count = 0;
      alumnosIds.forEach(id => {
        const row = df_eval.find(r => r.ID === id);
        if (row && row[`RA${ra.id_ra}`] !== undefined) {
          const val = parseFloat(row[`RA${ra.id_ra}`]);
          if (!isNaN(val)) {
            sum += val;
            count++;
          }
        }
      });
      return {
        name: `RA ${ra.id_ra}`,
        media: count > 0 ? parseFloat((sum / count).toFixed(2)) : 0,
        peso: ra.peso_ra
      };
    });
  };

  const raStats = getRaStats();

  return (
                <p className="text-muted">
                  Analítica visual del rendimiento académico del grupo.
                </p>
              </div>
              
              <div className="flex bg-foreground/5 p-1 rounded-lg border border-foreground/10">
                {["1T", "2T", "3T", "FINAL"].map(t => (
                  <button
                    key={t}
                    onClick={() => setEvalPeriod(t as any)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                      evalPeriod === t 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted hover:text-foreground hover:bg-foreground/5"
                    }`}
                  >
                    {t === "FINAL" ? "Final" : `${t} Ev.`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              
              {/* Rosco Global */}
              <div className="glass-card p-6 border-t-4 border-t-emerald-500 flex flex-col">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <PieChart className="w-5 h-5 text-emerald-500" /> Tasa de Éxito ({evalPeriod})
                </h3>
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={globalStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {globalStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Barras de RAs */}
              <div className="glass-card p-6 border-t-4 border-t-blue-500 lg:col-span-2 flex flex-col">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-500" /> Rendimiento Medio por RA
                </h3>
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={raStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} />
                      <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', borderRadius: '8px' }}
                        cursor={{fill: '#ffffff10'}}
                      />
                      <Bar dataKey="media" name="Nota Media" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Fila de Tarjetas Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-foreground/5 border border-[var(--glass-border)] p-6 rounded-xl text-center">
                <p className="text-muted text-sm mb-2">Total Alumnos (Matriculados)</p>
                <p className="text-4xl font-bold text-foreground">{alumnosIds.length}</p>
              </div>
              <div className="bg-foreground/5 border border-[var(--glass-border)] p-6 rounded-xl text-center">
                <p className="text-muted text-sm mb-2">Total Aprobados ({evalPeriod})</p>
                <p className="text-4xl font-bold text-emerald-500">{globalStats[0].value}</p>
              </div>
              <div className="bg-foreground/5 border border-[var(--glass-border)] p-6 rounded-xl text-center">
                <p className="text-muted text-sm mb-2">Total Suspensos ({evalPeriod})</p>
                <p className="text-4xl font-bold text-rose-500">{globalStats[1].value}</p>
              </div>
            </div>

      </MotionWrapper>
    </div>
  );
}
