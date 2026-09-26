import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { fetcher } from '@/services/api';
import { ModuleData, CursoData, ModuleDataSchema, CursoDataSchema } from '@/types';
import { getApiBase } from "@/services/apiBase";

export function useModulesList() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const url = userId ? `${getApiBase()}/api/modules?user_id=${userId}` : `${getApiBase()}/api/modules`;
  return useSWR(url, fetcher);
}

export function useModule(moduleId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(moduleId ? `${getApiBase()}/api/module/${moduleId}` : null, fetcher);
  
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
  const { data, error, isLoading, mutate } = useSWR(cursoId ? `${getApiBase()}/api/module/${cursoId}` : null, fetcher);

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
  return useSWR(`${getApiBase()}/api/users`, fetcher);
}

export function useAdminModules() {
  return useSWR(`${getApiBase()}/api/admin/modules`, fetcher);
}

export function useAssignments() {
  return useSWR(`${getApiBase()}/api/assignments`, fetcher);
}

export const saveAssignments = async (userId: string, moduleIds: number[]) => {
  const res = await fetch(`${getApiBase()}/api/assignments/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ module_ids: moduleIds })
  });
  const json = await res.json();
  if (json.status !== 'success') {
    throw new Error(json.message || 'Error guardando asignaciones');
  }
  return json;
};

export function useFamilies(regionId: number = 1) {
  return useSWR(`${getApiBase()}/api/families?region_id=${regionId}`, fetcher);
}

export function useLearningOutcomes() {
  return useSWR(`${getApiBase()}/api/learning_outcomes`, fetcher);
}
