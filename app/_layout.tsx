import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  // Ensure any route can link back to the first screen
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        
        {/* 🟢 1. The Login Screen (app/index.tsx) */}
        <Stack.Screen name="index" />

        {/* 🟢 2. The Register Screen (app/register.tsx) */}
        <Stack.Screen name="register" />

        {/* 🟢 3. The Dashboard & Tabs (app/(tabs)/index.tsx) */}
        <Stack.Screen name="(tabs)" />

        {/* 4. Other screens */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}