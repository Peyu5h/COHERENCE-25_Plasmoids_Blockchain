import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";

interface TransactionToasterProps {
  message: string;
  type: "loading" | "success" | "error";
  description?: string;
  toastId?: string | number;
}

export const TransactionToaster = ({
  message,
  type,
  description,
  toastId,
}: TransactionToasterProps) => {
  if (toastId) {
    toast.dismiss(toastId);
  }

  const newToastId = toast.custom(
    (t) => (
      <div
        className={cn(
          "group data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
          "bg-background border-border",
        )}
      >
        <div className="flex items-center space-x-4">
          {type === "loading" && (
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          )}
          {type === "success" && (
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          )}
          {type === "error" && <XCircle className="h-6 w-6 text-red-500" />}
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{message}</p>
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </div>
        </div>
      </div>
    ),
    {
      duration: type === "loading" ? Infinity : 5000,
      className: "group",
    },
  );

  return newToastId;
};

let currentLoadingToastId: string | number | undefined;

export const showTransactionToast = {
  loading: (message: string, description?: string) => {
    if (currentLoadingToastId) {
      toast.dismiss(currentLoadingToastId);
    }

    currentLoadingToastId = TransactionToaster({
      message,
      type: "loading",
      description,
    });
    return currentLoadingToastId;
  },

  success: (message: string, description?: string) => {
    if (currentLoadingToastId) {
      toast.dismiss(currentLoadingToastId);
      setTimeout(() => {
        TransactionToaster({
          message,
          type: "success",
          description,
        });
      }, 100);
    } else {
      TransactionToaster({
        message,
        type: "success",
        description,
      });
    }

    currentLoadingToastId = undefined;
  },

  error: (message: string, description?: string) => {
    if (currentLoadingToastId) {
      toast.dismiss(currentLoadingToastId);
      setTimeout(() => {
        TransactionToaster({
          message,
          type: "error",
          description,
        });
      }, 100);
    } else {
      TransactionToaster({
        message,
        type: "error",
        description,
      });
    }

    currentLoadingToastId = undefined;
  },
};
