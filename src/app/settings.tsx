import { useTheme, useThemedStyles, type ThemeMode } from "@/src/styles/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, Text, View } from "react-native";

const THEME_OPTIONS: {
  label: string;
  value: ThemeMode;
  description: string;
}[] = [
  { label: "System", value: "system", description: "Match device settings." },
  { label: "Light", value: "light", description: "Always use light mode." },
  { label: "Dark", value: "dark", description: "Always use dark mode." },
];

export default function SettingsScreen() {
  const { mode, setMode, theme } = useTheme();
  const styles = useThemedStyles((currentTheme) => ({
    root: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
      padding: currentTheme.spacing(4),
      gap: currentTheme.spacing(4),
    },
    sectionTitle: {
      color: currentTheme.colors.text,
      fontSize: currentTheme.typography.sizes.lg,
      fontWeight: currentTheme.typography.weights.semibold,
    },
    card: {
      backgroundColor: currentTheme.colors.secondary,
      borderRadius: currentTheme.radii.lg,
      padding: currentTheme.spacing(3),
      gap: currentTheme.spacing(2),
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: currentTheme.spacing(2),
      paddingHorizontal: currentTheme.spacing(2),
      borderRadius: currentTheme.radii.md,
      backgroundColor: currentTheme.colors.background,
    },
    optionSelected: {
      borderWidth: 1,
      borderColor: currentTheme.colors.primary,
    },
    optionPressed: {
      opacity: 0.85,
    },
    optionText: {
      flex: 1,
      gap: currentTheme.spacing(1),
      paddingRight: currentTheme.spacing(2),
    },
    optionLabel: {
      color: currentTheme.colors.text,
      fontSize: currentTheme.typography.sizes.md,
      fontWeight: currentTheme.typography.weights.medium,
    },
    optionDescription: {
      color: currentTheme.colors.text,
      opacity: 0.7,
      fontSize: currentTheme.typography.sizes.sm,
    },
    footerNote: {
      color: currentTheme.colors.text,
      opacity: 0.65,
      fontSize: currentTheme.typography.sizes.sm,
    },
  }));

  return (
    <View style={styles.root}>
      <Text style={styles.sectionTitle}>Appearance</Text>
      <View style={styles.card}>
        {THEME_OPTIONS.map((option) => {
          const isSelected = mode === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setMode(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}
            >
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>
              <Ionicons
                name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                size={22}
                color={
                  isSelected
                    ? theme.colors.primary
                    : theme.colors.tabIconDefault
                }
              />
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.footerNote}>
        Theme changes apply instantly and follow your device when set to system.
      </Text>
    </View>
  );
}
