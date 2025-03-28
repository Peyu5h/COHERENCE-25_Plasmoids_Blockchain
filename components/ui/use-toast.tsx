import { useToast as useToastOriginal } from "~/components/ui/toast";

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

// Export the hook for use in components
export const useToast = useToastOriginal;

// Create a helper function to be used outside of the React component
export const createToast = () => {
  const useToastValue = { toast: (_: ToastProps) => {} };
  // This is just a placeholder - the actual toast function will come from the useToast hook
  // When used in components

  return {
    toast: (props: ToastProps) => {
      console.warn("Toast called outside of a React component or custom hook.");
      return null;
    },
  };
};

export const { toast } = createToast();
