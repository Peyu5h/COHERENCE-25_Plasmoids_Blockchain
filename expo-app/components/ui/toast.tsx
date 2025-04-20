import * as ToastPrimitive from '@rn-primitives/toast';
import * as React from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { cn } from '~/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Portal } from '@rn-primitives/portal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createContext, useContext, useState, useRef, useEffect } from 'react';

const toastVariants = cva('border flex-row justify-between items-center p-4 rounded-xl', {
  variants: {
    variant: {
      default: 'bg-background border-border',
      destructive: 'bg-destructive border-destructive text-destructive-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface ToastProps
  extends Omit<ToastPrimitive.RootProps, 'type'>,
    VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  close?: React.ReactNode;
}

type ToastData = ToastProps & {
  id: string;
};

interface ToastContextType {
  toast: (props: Omit<ToastProps, 'open' | 'onOpenChange'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Root>, ToastProps>(
  ({ className, title, description, variant, action, close, ...props }, ref) => {
    const translateY = useRef(new Animated.Value(-20)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      // Entrance animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Exit animation when component will unmount
      return () => {
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: Dimensions.get('window').width,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      };
    }, []);

    return (
      <Animated.View
        style={{
          transform: [{ translateY }, { translateX }],
          opacity,
        }}
      >
        <ToastPrimitive.Root
          ref={ref}
          type="foreground"
          className={cn(toastVariants({ variant }), className)}
          {...props}
        >
          <View className="gap-1.5 px-2">
            {title && (
              <ToastPrimitive.Title
                className={cn(
                  'text-foreground text-xl font-semibold',
                  variant === 'destructive' && 'text-destructive-foreground'
                )}
              >
                {title}
              </ToastPrimitive.Title>
            )}
            {description && (
              <ToastPrimitive.Description
                className={cn(
                  'text-muted-foreground text-base',
                  variant === 'destructive' && 'text-destructive-foreground'
                )}
              >
                {description}
              </ToastPrimitive.Description>
            )}
          </View>
        </ToastPrimitive.Root>
      </Animated.View>
    );
  }
);
Toast.displayName = ToastPrimitive.Root.displayName;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const insets = useSafeAreaInsets();

  const showToast = (props: Omit<ToastProps, 'open' | 'onOpenChange'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...props, id, open: true, onOpenChange: () => {} }]);

    setTimeout(() => {
      setToasts((prev) => {
        const targetIndex = prev.findIndex((toast) => toast.id === id);
        if (targetIndex === -1) return prev;

        setTimeout(() => {
          setToasts((p) => p.filter((t) => t.id !== id));
        }, 200);

        return prev;
      });
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ toast: showToast }}>
      {children}
      <Portal name="toast">
        <View style={{ top: insets.top + 24 }} className="absolute w-full px-4 gap-2">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              open={true}
              onOpenChange={(open) => {
                if (!open) {
                  setTimeout(() => {
                    setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                  }, 200);
                }
              }}
            />
          ))}
        </View>
      </Portal>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
