import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      initialRouteName="roster-overview"
    >
      <Tabs.Screen name="roster-overview" options={{ title: "Overview" }} />
      <Tabs.Screen name="roster-units" options={{ title: "Units" }} />
    </Tabs>
  );
}
