import '~/global.css';
import { Tabs } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '~/components/ui/text';
import { View, Pressable } from 'react-native';
import { cn } from '~/lib/utils';
import { PortalHost } from '@rn-primitives/portal';
import { ToastProvider } from '~/components/ui/toast';
import { ThemeToggle } from '~/components/ThemeToggle';
import { getColor } from '~/lib/utils';

export default function RootLayout() {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <View className={cn('flex-1 ', isDarkColorScheme ? 'dark' : '')}>
      <ToastProvider>
        <Tabs
          screenOptions={{
            headerRight: () => <ThemeToggle />,
            tabBarActiveTintColor: getColor('foreground'),
            tabBarInactiveTintColor: getColor('muted-foreground'),
            tabBarShowLabel: false,
            tabBarStyle: {
              elevation: 0,
              borderTopWidth: 0,
              position: 'relative',
              display: 'flex',
              backgroundColor: getColor('background'),
            },
            headerStyle: {
              backgroundColor: getColor('background'),
            },
            headerTintColor: getColor('foreground'),
            tabBarItemStyle: {
              paddingVertical: 5,
            },
            tabBarIconStyle: {
              marginBottom: -3,
            },
            tabBarButton: (props) => {
              const { children, onPress } = props;
              return (
                <Pressable onPress={onPress} className="flex-1">
                  {({ pressed }) => (
                    <View
                      className={cn(
                        'flex-1 items-center justify-center',
                        pressed && 'bg-primary/20'
                      )}
                    >
                      {children}
                    </View>
                  )}
                </Pressable>
              );
            },
          }}
        >
          <Tabs.Screen
            name="+not-found"
            options={{
              href: null,
            }}
          />

          <Tabs.Screen
            name="index"
            options={{
              title: 'AuthSwap',
              tabBarIcon: ({ focused, color }) => (
                <View style={{ alignItems: 'center' }}>
                  <View
                    className="h-0.5 w-24 absolute -top-3.5 rounded-full bg-secondary-foreground"
                    style={{
                      opacity: focused ? 1 : 0,
                      transform: [{ scaleX: focused ? 1 : 0 }],
                    }}
                  />
                  <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
                </View>
              ),
              tabBarLabel: ({ focused, color }) => (
                <Text className={`text-xs ${focused ? 'font-bold' : ''}`} style={{ color }}>
                  Home
                </Text>
              ),
            }}
          />
        </Tabs>
        <PortalHost />
      </ToastProvider>
    </View>
  );
}
