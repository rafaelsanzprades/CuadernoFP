import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { generatePlanning } from '@/utils/planningGenerator';

export function useDynamicPlanning() {
  const { cursoData, moduleData } = useAppStore();

  return useMemo(() => {
    if (!cursoData || !moduleData) {
      return {
        planningLedger: {},
        df_sgmt: [],
        totalUdHours: 0,
        totalScheduledHours: 0
      };
    }

    const { newPlanningLedger, newDfSgmt, totalUdHours, totalScheduledHours } = generatePlanning(moduleData, cursoData);

    return {
      planningLedger: newPlanningLedger,
      df_sgmt: newDfSgmt,
      totalUdHours,
      totalScheduledHours
    };
  }, [cursoData, moduleData]);
}
