import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
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
        <Tabs.Screen
          name="roster-overview"
          options={{
            title: "Overview",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="roster-units"
          options={{
            title: "Units",
            tabBarIcon: ({ color, size }) => (
              <AntDesign name="deployment-unit" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="unit-details"
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
