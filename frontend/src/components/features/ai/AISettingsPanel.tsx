import React, { useState, useEffect } from "react";
import { Key, Bot, Save, Sparkles, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export function AISettingsPanel() {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("gemini");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("cdd_ai_api_key");
    const savedProvider = localStorage.getItem("cdd_ai_provider");
    if (savedKey) setApiKey(savedKey);
    if (savedProvider) setProvider(savedProvider);
  }, []);

  const handleSave = () => {
    localStorage.setItem("cdd_ai_api_key", apiKey.trim());
    localStorage.setItem("cdd_ai_provider", provider);
    setSaved(true);
    toast.success("Configuración de IA guardada localmente");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="p-6 border border-accent/25 rounded-2xl bg-accent/5 shadow-lg space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="w-6 h-6 text-accent" />
        <div>
          <h3 className="text-xl font-bold text-foreground">Asistente Mágico (IA)</h3>
          <p className="text-sm text-muted">Importa programaciones desde PDF automáticamente</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Bot className="w-4 h-4 text-info" /> Motor de Inteligencia Artificial
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-base text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          >
            <option value="gemini">Google Gemini (Recomendado - Gratis para desarrolladores)</option>
            <option value="openai">OpenAI ChatGPT (Requiere saldo en la cuenta)</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Key className="w-4 h-4 text-info" /> Tu API Key (BYOK)
          </label>
          <input
            type="password"
            placeholder={`Pega aquí tu clave secreta de ${provider === 'gemini' ? 'Google AI Studio' : 'OpenAI'}...`}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-base text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
          <p className="text-[0.75rem] text-muted ml-1">
            Tu clave se guarda de forma segura en tu navegador y nunca se comparte con terceros.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className="w-full py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30 transition-all shadow-md"
        >
          {saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? "Guardado" : "Guardar Configuración"}
        </Button>
      </div>
    </Card>
  );
}
