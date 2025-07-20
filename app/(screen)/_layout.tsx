// app\(screen)\_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function ScreenLayout() {
  return (
    <Stack>
      <StatusBar style='auto'/>
      <Stack.Screen name='notifications' options={{ headerShown: false }} />
      <Stack.Screen name='privacy-policy' options={{ headerShown: false }} />
    </Stack>
  );
}
