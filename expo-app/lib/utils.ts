import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Platform, useColorScheme } from 'react-native';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getColor(variable: string) {
  const colorScheme = useColorScheme();
  const isDarkColorScheme = colorScheme === 'dark';

  const colors = {
    background: isDarkColorScheme ? 'hsl(20 14.3% 4.1%)' : 'hsl(0 0% 100%)',
    foreground: isDarkColorScheme ? 'hsl(60 9.1% 97.8%)' : 'hsl(20 14.3% 4.1%)',
    'muted-foreground': isDarkColorScheme ? 'hsl(24 5.4% 63.9%)' : 'hsl(25 5.3% 44.7%)',
    primary: isDarkColorScheme ? 'hsl(47.9 95.8% 53.1%)' : 'hsl(47.9 95.8% 53.1%)',
    'primary-foreground': isDarkColorScheme ? 'hsl(26 83.3% 14.1%)' : 'hsl(26 83.3% 14.1%)',
    secondary: isDarkColorScheme ? 'hsl(12 6.5% 15.1%)' : 'hsl(60 4.8% 95.9%)',
    'secondary-foreground': isDarkColorScheme ? 'hsl(60 9.1% 97.8%)' : 'hsl(24 9.8% 10%)',
  };

  return colors[variable as keyof typeof colors] || variable;
}
