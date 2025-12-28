import { Tabs, useLocalSearchParams } from "expo-router";
import { RosterProvider } from "../../context/RosterContext";

export default function TabLayout() {
  const params = useLocalSearchParams();
  const rosterId = Array.isArray(params.rosterId)
    ? params.rosterId[0]
    : params.rosterId;

  return (
    <RosterProvider initialRosterId={rosterId}>
      <Tabs
        screenOptions={{ headerShown: false }}
        initialRouteName="roster-overview"
      >
        <Tabs.Screen name="roster-overview" options={{ title: "Overview" }} />
        <Tabs.Screen name="roster-units" options={{ title: "Units" }} />
        <Tabs.Screen
          name="modal"
          options={{
            title: "Unit",
            href: null,
            tabBarStyle: { display: "none" },
          }}
        />
      </Tabs>
    </RosterProvider>
  );
}
