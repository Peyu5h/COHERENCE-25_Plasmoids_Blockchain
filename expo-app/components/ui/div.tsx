import * as Slot from '@rn-primitives/slot';
import type { SlottableViewProps, ViewRef } from '@rn-primitives/types';
import * as React from 'react';
import { View as RNView } from 'react-native';
import { cn } from '~/lib/utils';
import { TextClassContext } from './text';

const DivClassContext = React.createContext<string | undefined>(undefined);

// Helper function to categorize classes
const categorizeClasses = (classes: string[]) => {
  const textRelatedClasses = classes.filter(cls => 
    cls.startsWith('text-') || 
    cls.startsWith('font-') || 
    cls.startsWith('tracking-') ||
    cls.startsWith('leading-') ||
    // Add font weight classes
    ['font-thin', 'font-extralight', 'font-light', 'font-normal', 
     'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 
     'font-black'].includes(cls) ||
    // Add text alignment
    ['text-left', 'text-center', 'text-right'].includes(cls) ||
    // Add text decoration
    ['underline', 'line-through', 'no-underline'].includes(cls)
  );

  const layoutClasses = classes.filter(cls => 
    cls.startsWith('flex-') || 
    cls.startsWith('items-') || 
    cls.startsWith('justify-') ||
    cls.startsWith('gap-') ||
    cls.startsWith('p-') ||
    cls.startsWith('px-') ||
    cls.startsWith('py-') ||
    cls.startsWith('pt-') ||
    cls.startsWith('pb-') ||
    cls.startsWith('pl-') ||
    cls.startsWith('pr-') ||
    cls.startsWith('m-') ||
    cls.startsWith('mx-') ||
    cls.startsWith('my-') ||
    cls.startsWith('mt-') ||
    cls.startsWith('mb-') ||
    cls.startsWith('ml-') ||
    cls.startsWith('mr-') ||
    cls.startsWith('w-') ||
    cls.startsWith('h-') ||
    cls.startsWith('min-') ||
    cls.startsWith('max-') ||
    cls.startsWith('rounded')
  );

  const colorAndEffectClasses = classes.filter(cls => 
    cls.startsWith('bg-') || 
    cls.startsWith('border-') ||
    cls.startsWith('shadow-') ||
    cls.startsWith('opacity-') ||
    cls.startsWith('z-') ||
    cls.startsWith('overflow-')
  );

  return {
    textClasses: textRelatedClasses.join(' '),
    layoutClasses: layoutClasses.join(' '),
    colorAndEffectClasses: colorAndEffectClasses.join(' ')
  };
};

const Div = React.forwardRef<ViewRef, SlottableViewProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const parentDivClass = React.useContext(DivClassContext);
    const parentTextClass = React.useContext(TextClassContext);
    const Component = asChild ? Slot.View : RNView;

    const classes = (className || '').split(' ').filter(Boolean);
    const { textClasses, layoutClasses, colorAndEffectClasses } = categorizeClasses(classes);

    // Combine with parent classes
    const combinedDivClasses = cn(
      parentDivClass,
      layoutClasses,
      colorAndEffectClasses
    );

    const combinedTextClasses = cn(
      parentTextClass,
      textClasses
    );

    return (
      <DivClassContext.Provider value={combinedDivClasses}>
        <TextClassContext.Provider value={combinedTextClasses}>
          <Component
            className={combinedDivClasses}
            ref={ref}
            {...props}
          />
        </TextClassContext.Provider>
      </DivClassContext.Provider>
    );
  }
);

Div.displayName = 'Div';

export { Div, DivClassContext }; 