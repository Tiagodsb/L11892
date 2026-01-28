import InitDb from "@/database/initDb";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";

export default function RootLayout() {
  return <SQLiteProvider databaseName="L11892.db" onInit={InitDb}>
    <Stack>
      <Stack.Screen name="index" options={{title: "Lei N° 11.892"}}/>
    </Stack>
  </SQLiteProvider>
}
