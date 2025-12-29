import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
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
    </Tabs>
  );
}
