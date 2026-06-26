import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

export interface MultiSelectOption {
  id: string;
  label: string;
}

export interface MultiSelectDropdownProps {
  options: MultiSelectOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelectDropdown({
  options,
  selectedIds,
  onChange,
  placeholder = "Seleccionar...",
  className = ""
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(selected => selected !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeOption = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onChange(selectedIds.filter(selected => selected !== id));
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[34px] w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 flex items-center justify-between cursor-pointer focus-within:border-accent"
      >
        <div className="flex flex-wrap gap-1 flex-1 overflow-hidden">
          {selectedIds.length === 0 ? (
            <span className="text-foreground/50 text-xs py-0.5">{placeholder}</span>
          ) : (
            selectedIds.map(id => {
              const opt = options.find(o => o.id === id);
              // Si no lo encuentra en las opciones predefinidas, lo mostramos tal cual (texto libre legacy)
              const label = opt ? opt.id : id;
              const fullTitle = opt ? opt.label : id;
              return (
                <span 
                  key={id} 
                  title={fullTitle}
                  className="bg-accent/20 text-accent text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"
                >
                  {label}
                  <button 
                    onClick={(e) => removeOption(e, id)}
                    className="hover:text-foreground p-0.5 rounded-full hover:bg-accent/40"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              );
            })
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform ml-1 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-[300px] mt-1 bg-background border border-[var(--glass-border)] rounded-md shadow-xl max-h-60 overflow-auto right-0">
          <div className="p-1">
            {options.map(option => (
              <div 
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className="flex items-start gap-2 px-2 py-1.5 hover:bg-foreground/10 rounded cursor-pointer text-xs"
              >
                <div className="mt-0.5 w-4 h-4 rounded border border-muted/50 flex items-center justify-center flex-shrink-0 bg-background">
                  {selectedIds.includes(option.id) && <Check className="w-3 h-3 text-accent" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-accent">{option.id}</span>
                  <span className="text-foreground/80">{option.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
