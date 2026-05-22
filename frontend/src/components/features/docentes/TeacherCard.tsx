import React from 'react';
import { ShieldAlert, CheckCircle2, BookOpen, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface TeacherCardProps {
  teacher: { id: number; name: string; surname: string; email: string };
  hours: number;
  assignedModules: { groupName: string; moduleName: string; hours: number; code: string }[];
  isExpanded: boolean;
  toggleExpand: () => void;
}

export function TeacherCard({ teacher, hours, assignedModules, isExpanded, toggleExpand }: TeacherCardProps) {
  const isOverloaded = hours > 500;
  const progressPercentage = Math.min(100, (hours / 600) * 100);

  return (
    <Card className={`transition-all duration-300 flex flex-col justify-between ${isOverloaded ? "border-red-500/20" : "border-white/5"}`}>
      <div className="p-6 space-y-4">
        {/* Cabecera de la Tarjeta */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">
              {teacher.name} {teacher.surname}
            </h3>
            <p className="text-xs text-gray-400 mt-1">{teacher.email}</p>
          </div>
          {isOverloaded ? (
            <Badge variant="danger" className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Sobrecarga
            </Badge>
          ) : hours > 0 ? (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Correcto
            </Badge>
          ) : (
            <Badge variant="default" className="text-gray-500 border-gray-600 bg-gray-800/50">
              Sin asignar
            </Badge>
          )}
        </div>

        {/* Resumen de carga horaria */}
        <div className="bg-black/20 rounded-lg p-4 border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-accent" />
              Carga Lectiva
            </span>
            <span className={`text-xl font-black ${isOverloaded ? 'text-red-400' : 'text-white'}`}>
              {hours} <span className="text-sm font-normal text-gray-500">/ 600h</span>
            </span>
          </div>
          
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                isOverloaded ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                hours > 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-transparent'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Módulos asignados (Collapsible) */}
        {assignedModules.length > 0 && (
          <div className="pt-2 border-t border-white/5">
            <button 
              onClick={toggleExpand}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-400 hover:text-white transition-colors py-1"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{assignedModules.length} módulos asignados</span>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {isExpanded && (
              <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                {assignedModules.map((m, idx) => (
                  <div key={idx} className="bg-white/5 rounded px-3 py-2 border border-white/5">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-accent font-mono text-[10px] font-bold">{m.code}</span>
                      <span className="text-xs font-semibold text-gray-300">{m.hours}h</span>
                    </div>
                    <p className="text-sm text-white font-medium leading-tight mb-1">{m.moduleName}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">{m.groupName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
