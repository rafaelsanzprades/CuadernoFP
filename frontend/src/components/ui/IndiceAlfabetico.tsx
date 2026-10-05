"use client";
import { useTranslation } from "react-i18next";

// Índice tipo teclado de teléfono (ABC, DEF, ...) por la inicial del primer
// apellido. Cada pastilla avisa con el alumno/a que va primero (por orden
// alfabético) dentro de ese grupo de letras; las pastillas sin nadie quedan
// atenuadas. La página decide qué hacer con el aviso (desplazar la lista,
// seleccionar al alumno/a, ...).

const GRUPOS_LETRAS = ["ABC", "DEF", "GHI", "JKL", "MNO", "PQRS", "TUV", "WXYZ"];

// Inicial del primer apellido sin acentos y en mayúscula (Ñ cuenta como N).
function inicialApellido(apellidos?: string): string {
  return String(apellidos || "").trim().normalize("NFD").replace(/[̀-ͯ]/g, "").charAt(0).toUpperCase();
}

export function IndiceAlfabetico<T extends string | number>({
  alumnos, onSelect, className = "",
}: {
  alumnos: { id: T; apellidos?: string | null }[];
  onSelect: (id: T) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  if (alumnos.length === 0) return null;
  return (
    <nav aria-label={t('aria.alumnado.indiceAlfabetico', {defaultValue: 'Índice alfabético'})} className={`flex flex-wrap gap-2 ${className}`}>
      {GRUPOS_LETRAS.map((grupo) => {
        const destino = alumnos
          .filter((a) => grupo.includes(inicialApellido(a.apellidos ?? "")))
          .sort((x, y) => String(x.apellidos || "").localeCompare(String(y.apellidos || ""), "es"))[0];
        return (
          <button
            key={grupo}
            disabled={!destino}
            onClick={() => destino && onSelect(destino.id)}
            className="text-caption font-medium px-3 py-1.5 rounded-lg text-white border border-white/20 hover:bg-white/10 transition-colors tracking-widest disabled:opacity-30 disabled:cursor-default disabled:hover:bg-transparent"
          >
            {grupo}
          </button>
        );
      })}
    </nav>
  );
}
