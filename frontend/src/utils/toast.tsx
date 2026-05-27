import toast from "react-hot-toast";

export const showRichToast = {
  success: (message: string, description?: string) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-background/90 backdrop-blur-xl shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black/5 border border-[var(--glass-border)] overflow-hidden`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-400 text-xl font-bold">✓</span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-bold text-foreground">{message}</p>
              {description && <p className="mt-1 text-xs text-muted">{description}</p>}
            </div>
          </div>
        </div>
        <div className="flex border-l border-[var(--glass-border)]">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full h-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-muted hover:text-foreground hover:bg-foreground/5 focus:outline-none transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    ), { duration: 4000 });
  },

  error: (message: string, description?: string) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-background/90 backdrop-blur-xl shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black/5 border border-[var(--glass-border)] overflow-hidden`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-400 text-xl font-bold">✕</span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-bold text-foreground">{message}</p>
              {description && <p className="mt-1 text-xs text-muted">{description}</p>}
            </div>
          </div>
        </div>
        <div className="flex border-l border-[var(--glass-border)]">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full h-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-muted hover:text-foreground hover:bg-foreground/5 focus:outline-none transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  },

  withUndo: (message: string, onUndo: () => void, description?: string) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-background/90 backdrop-blur-xl shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black/5 border border-[var(--glass-border)] overflow-hidden`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 text-xl font-bold">ℹ️</span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-bold text-foreground">{message}</p>
              {description && <p className="mt-1 text-xs text-muted">{description}</p>}
            </div>
          </div>
        </div>
        <div className="flex flex-col border-l border-[var(--glass-border)] min-w-[90px]">
          <button
            onClick={() => {
              onUndo();
              toast.dismiss(t.id);
            }}
            className="w-full flex-1 border-b border-[var(--glass-border)] p-2 flex items-center justify-center text-sm font-bold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
          >
            Deshacer
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full flex-1 p-2 flex items-center justify-center text-xs font-medium text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            Ignorar
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  }
};
