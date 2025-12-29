import { RosterProvider, useRosterContext } from "@/src/context/RosterContext";
import { useRosterUnitDetails } from "@/src/hooks/useRosterUnitDetails";
import { ThemeProvider } from "@/src/styles/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useGlobalSearchParams } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const params = useGlobalSearchParams();
  const rosterId = Array.isArray(params.rosterId)
    ? params.rosterId[0]
    : params.rosterId;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RosterProvider initialRosterId={rosterId}>
          <RootStack />
        </RosterProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootStack() {
  const { selectedRoster } = useRosterContext();
  const params = useGlobalSearchParams();
  const unitId = Array.isArray(params.unitId) ? params.unitId[0] : params.unitId;
  const unitDetails = useRosterUnitDetails(
    selectedRoster?.roster ?? null,
    unitId ?? null
  );
  const rosterTitle =
    selectedRoster?.roster?.name ?? selectedRoster?.meta?.name ?? "My Army";
  const unitTitle = unitDetails?.name ?? "Unit Details";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerHomeButton: {},
});
