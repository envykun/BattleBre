import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Colors from './constants/Colors';
import { DataContext, DataContextType } from './hooks/DataContext';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const onLayoutRootView = useCallback(async () => {
    if (isLoadingComplete) {
      await SplashScreen.hideAsync();
    }
  }, [isLoadingComplete]);

  const [context, setContext] = useState({
    fileName: '',
    rosterCost: { points: '0', cp: '0', faction: '' },
    unitData: [],
  });

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <DataContext.Provider value={{ context, setContext }}>
          <Navigation colorScheme={colorScheme} />
          <StatusBar backgroundColor={Colors[colorScheme].primary} />
        </DataContext.Provider>
      </SafeAreaProvider>
    );
  }
}
