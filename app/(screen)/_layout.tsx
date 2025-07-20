// app\(screen)\_layout.tsx
import { Stack } from "expo-router";

export default function ScreenLayout() {
  return (
    <Stack>
      <Stack.Screen name='notifications' options={{ headerShown: false }} />
      <Stack.Screen name='privacy-policy' options={{ headerShown: false }} />
    </Stack>
  );
}
