import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { generatePlanning, ledgerToDmy } from '@/utils/planningGenerator';

export function useDynamicPlanning() {
  const { cursoData, moduleData } = useAppStore();

  return useMemo(() => {
    if (!cursoData || !moduleData) {
      return {
        planningLedger: {},
        planningLedgerDmy: {},
        df_sgmt: [],
        totalUdHours: 0,
        totalScheduledHours: 0
      };
    }

    const { newPlanningLedger, newDfSgmt, totalUdHours, totalScheduledHours } = generatePlanning(moduleData, cursoData);

    return {
      // Clave ISO (yyyy-mm-dd) — para seguimiento/calificaciones y otros
      // consumidores que ya construyen fechas en ese formato.
      planningLedger: newPlanningLedger,
      // Clave dd/mm/yyyy — para calendar_notes, /calendario y los
      // generadores de PDF del backend, que usan ese formato.
      planningLedgerDmy: ledgerToDmy(newPlanningLedger),
      df_sgmt: newDfSgmt,
      totalUdHours,
      totalScheduledHours
    };
  }, [cursoData, moduleData]);
}
