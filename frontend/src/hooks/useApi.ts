import useSWR from 'swr';
import { fetcher } from '@/services/api';
import { ModuleData, CursoData, ModuleDataSchema, CursoDataSchema } from '@/types';

export function useModulesList() {
  return useSWR('/api/modules', fetcher);
}

export function useModule(moduleId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(moduleId ? `/api/module/${moduleId}` : null, fetcher);
  
  // Opcional: Validar con Zod en tiempo de ejecución
  let parsedData: ModuleData | null = null;
  if (data) {
    try {
      parsedData = ModuleDataSchema.parse(data);
    } catch (e) {
      console.warn("Module data validation failed", e);
      parsedData = data as ModuleData; // Fallback
    }
  }

  return {
    moduleData: parsedData,
    isLoading,
    isError: error,
    mutate
  };
}

export function useCurso(cursoId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(cursoId ? `/api/module/${cursoId}` : null, fetcher);

  let parsedData: CursoData | null = null;
  if (data) {
    try {
      parsedData = CursoDataSchema.parse(data);
    } catch (e) {
      console.warn("Curso data validation failed", e);
      parsedData = data as CursoData; // Fallback
    }
  }

  return {
    cursoData: parsedData,
    isLoading,
    isError: error,
    mutate
  };
}

export function useUsers() {
  return useSWR('/api/users', fetcher);
}

export function useFamilies() {
  return useSWR('/api/families', fetcher);
}

export function useLearningOutcomes() {
  return useSWR('/api/learning_outcomes', fetcher);
}
