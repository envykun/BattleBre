import { RosterProvider, useRosterContext } from "@/src/context/RosterContext";
import { useRosterUnitDetails } from "@/src/hooks/useRosterUnitDetails";
import { ThemeProvider } from "@/src/styles/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useGlobalSearchParams } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const params = useGlobalSearchParams();
  const rosterId = Array.isArray(params.rosterId)
    ? params.rosterId[0]
    : params.rosterId;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RosterProvider initialRosterId={rosterId}>
            <RootStack />
          </RosterProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootStack() {
  const { selectedRoster } = useRosterContext();
  const params = useGlobalSearchParams();
  const unitId = Array.isArray(params.unitId)
    ? params.unitId[0]
    : params.unitId;
  const unitDetails = useRosterUnitDetails(
    selectedRoster?.roster ?? null,
    unitId ?? null
  );
  const rosterTitle =
    selectedRoster?.roster?.name ?? selectedRoster?.meta?.name ?? "My Army";
  const unitTitle = unitDetails?.name ?? "Unit Details";

  return (
    <Stack screenOptions={{ headerTitleAlign: "center" }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          title: rosterTitle,
          headerLeft: () => (
            <Pressable
              onPress={() => router.dismissAll()}
              hitSlop={8}
              style={styles.headerHomeButton}
            >
              <Ionicons name="home-outline" size={24} color="black" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/under-construction")}
              hitSlop={8}
              style={styles.headerHomeButton}
            >
              <Ionicons name="construct-outline" size={24} color="black" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: true,
          headerBackButtonDisplayMode: "generic",
        }}
      />
      <Stack.Screen
        name="unit-details"
        options={{
          title: unitTitle,
          headerShown: true,
          headerBackButtonDisplayMode: "generic",
        }}
      />
      <Stack.Screen
        name="under-construction"
        options={{ title: "Construction Site" }}
      />
      <Stack.Screen name="+not-found" options={{ title: "Oops!" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerHomeButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
  },
});
