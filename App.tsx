import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Colors from "./constants/Colors";
import { DataContext, DataContextType } from "./hooks/DataContext";

import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  const [context, setContext] = useState({ fileName: "", rosterCost: { points: "0", cp: "0", faction: "" }, unitData: [] });

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <DataContext.Provider value={{ context, setContext }}>
          <Navigation colorScheme={colorScheme} />
          <StatusBar backgroundColor={Colors[colorScheme].primary} />
        </DataContext.Provider>
      </SafeAreaProvider>
    );
  }
}
