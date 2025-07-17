// app\(auth)\_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
  return (
    <>
      <StatusBar style='dark' />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='sign-in' />
        <Stack.Screen name='sign-up' />
        <Stack.Screen name='forgot-password' />
      </Stack>
    </>
  );
}
