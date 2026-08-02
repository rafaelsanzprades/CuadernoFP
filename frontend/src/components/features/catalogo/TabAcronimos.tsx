import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { acronymsData, CATEGORY_LABELS, AcronymCategory } from "@/data/acronymsData";

export function TabAcronimos() {
  const [searchTerm, setSearchTerm] = useState("");

  const orderedCategories: AcronymCategory[] = [
    'metodologia',
    'inclusion',
    'estructura_fp',
    'normativa',
    'boletines',
    'codificacion',
    'otros'
  ];

  const filteredData = acronymsData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="p-6 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-accent" />
            <h2 className="text-subheading font-bold text-foreground">Acrónimos y glosario</h2>
          </div>
          <div className="w-full md:w-72 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <Input 
              placeholder="Buscar término o descripción..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-8">
          {orderedCategories.map(category => {
            const items = filteredData.filter(item => item.category === category);
            if (items.length === 0) return null;

            return (
              <div key={category} className="animate-in fade-in duration-300">
                <h3 className="text-body font-semibold text-accent mb-3 border-b border-[var(--glass-border)] pb-2">
                  {CATEGORY_LABELS[category]}
                </h3>
                
                <div className="prose prose-sm dark:prose-invert max-w-none 
                  prose-table:w-full prose-table:border-collapse prose-table:border-[var(--glass-border)]
                  prose-th:border-[var(--glass-border)] prose-th:bg-foreground/5 prose-th:p-2 prose-th:text-left
                  prose-td:border-[var(--glass-border)] prose-td:p-2 prose-td:text-muted prose-td:break-words
                ">
                  <table>
                    <thead>
                      <tr>
                        <th className="w-1/3">Nombre</th>
                        <th>Descripción corta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id} className="hover:bg-foreground/[0.02] transition-colors">
                          <td className="font-medium text-foreground">{item.name}</td>
                          <td>{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          
          {filteredData.length === 0 && (
            <div className="text-center py-12 text-muted border border-dashed border-[var(--glass-border)] rounded-lg">
              <p>No se han encontrado resultados para "{searchTerm}"</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
