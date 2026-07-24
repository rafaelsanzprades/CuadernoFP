"use client";
import { Info, Briefcase, School, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export function DualTab() {
  const { moduleData, updateModuleData } = useAppStore();

  if (!moduleData) return null;

  const dualRegimen = moduleData.dual_regimen || "ninguno";
  const ras = moduleData.df_ra || [];
  
  // Parse is_dual safely, defaulting to 0
  const parsePercent = (val: string | null | undefined) => {
    if (!val) return 0;
    const num = parseInt(val, 10);
    return isNaN(num) ? 0 : num;
  };

  const handleRegimenChange = (val: string) => {
    updateModuleData("dual_regimen", val);
  };

  const handleRaDualChange = (id_ra: string, percent: number) => {
    const updatedRas = ras.map(ra => 
      ra.id_ra === id_ra ? { ...ra, is_dual: percent.toString() } : ra
    );
    updateModuleData("df_ra", updatedRas);
  };

  const totalHoras = moduleData.info_modulo?.h_boa || 100;
  
  // Weighted percentage calculation
  let totalWeight = 0;
  let accumulatedCompanyWeight = 0;
  
  ras.forEach(ra => {
    const weight = ra.peso_ra || 10;
    const companyPercent = parsePercent(ra.is_dual);
    
    totalWeight += weight;
    accumulatedCompanyWeight += (weight * (companyPercent / 100));
  });

  const percentInCompany = totalWeight > 0 ? (accumulatedCompanyWeight / totalWeight) * 100 : 0;
  const hoursInCompany = (percentInCompany / 100) * totalHoras;

  // Validation
  let isValid = true;
  let validationMessage = "";
  if (dualRegimen === "general") {
    if (percentInCompany < 25 || percentInCompany > 35) {
      isValid = false;
      validationMessage = "En Régimen General, la empresa debe asumir entre el 25% y el 35% del currículo.";
    }
  } else if (dualRegimen === "intensivo") {
    if (percentInCompany < 35 || percentInCompany > 50) {
      isValid = false;
      validationMessage = "En Régimen Intensivo, la empresa debe asumir entre el 35% y el 50% del currículo.";
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-accent/5 border-accent/20">
        <div className="flex items-start gap-4">
          <Briefcase className="w-6 h-6 text-accent mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Régimen dual LO 3/2022</h3>
            <p className="text-muted text-sm mt-1">
              Selecciona el régimen de Formación Profesional Dual en el que se imparte este módulo.
            </p>
            
            <div className="mt-4 max-w-sm">
              <label className="block text-sm font-medium mb-1">Régimen</label>
              <Select
                value={dualRegimen}
                onChange={(e) => handleRegimenChange(e.target.value)}
              >
                <option value="ninguno">Ninguno / Tradicional</option>
                <option value="general">Dual General (25% - 35% empresa)</option>
                <option value="intensivo">Dual Intensivo (35% - 50% empresa)</option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {dualRegimen !== "ninguno" && (
        <MotionWrapper className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Distribución centro - empresa</h3>
            
            <div className="mb-6 flex flex-col md:flex-row items-center gap-6 p-4 rounded-lg bg-background border">
              <div className="flex-1 w-full">
                <div className="flex justify-between text-sm mb-2">
                  <span className="flex items-center gap-1 font-medium"><School className="w-4 h-4 text-primary" /> Centro Educativo</span>
                  <span className="flex items-center gap-1 font-medium"><Briefcase className="w-4 h-4 text-accent" /> Empresa</span>
                </div>
                
                <div className="h-4 w-full bg-accent/20 rounded-full overflow-hidden flex relative">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${100 - percentInCompany}%` }}
                  />
                  <div 
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${percentInCompany}%` }}
                  />
                  
                  {/* Guideline markers */}
                  <div className="absolute top-0 bottom-0 left-[65%] w-px bg-white/50 z-10" title="35% (Límite General/Intensivo)" />
                  <div className="absolute top-0 bottom-0 left-[75%] w-px bg-white/50 z-10" title="25% (Mínimo General)" />
                </div>
                
                <div className="flex justify-between text-xs text-muted mt-2">
                  <span>{(100 - percentInCompany).toFixed(1)}% ({Math.round(totalHoras - hoursInCompany)}h)</span>
                  <span>{percentInCompany.toFixed(1)}% ({Math.round(hoursInCompany)}h)</span>
                </div>
              </div>
              
              {!isValid && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm max-w-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{validationMessage}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {ras.map((ra) => {
                const percent = parsePercent(ra.is_dual);
                return (
                  <div key={ra.id_ra} className="p-4 rounded-xl border bg-[var(--glass-bg)] flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">RA {ra.id_ra}</h4>
                        <p className="text-sm text-muted mt-1">{ra.desc_ra}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-muted block">Peso: {ra.peso_ra}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <School className="w-4 h-4 text-primary opacity-50" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={percent}
                        onChange={(e) => handleRaDualChange(ra.id_ra, parseInt(e.target.value))}
                        className="flex-1 accent-accent h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer"
                      />
                      <Briefcase className="w-4 h-4 text-accent opacity-50" />
                      <span className="w-12 text-right text-sm font-medium">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </MotionWrapper>
      )}
    </div>
  );
}
