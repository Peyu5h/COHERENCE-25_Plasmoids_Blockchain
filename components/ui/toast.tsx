import * as React from "react";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

type ToastContextType = {
  toast: (props: ToastProps) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined,
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const toast = React.useCallback((props: ToastProps) => {
    const id = Date.now();
    setToasts((prev) => [...prev, props]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((_, index) => index !== 0));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed right-0 bottom-0 z-50 flex flex-col items-end space-y-2 p-4">
        {toasts.map((t, i) => (
          <div
            key={i}
            className={`rounded-md px-6 py-4 shadow-md ${
              t.variant === "destructive"
                ? "bg-destructive text-white"
                : "bg-background text-foreground"
            }`}
          >
            {t.title && <h3 className="font-medium">{t.title}</h3>}
            {t.description && <p className="text-sm">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
