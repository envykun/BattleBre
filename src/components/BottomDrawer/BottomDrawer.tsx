/**
 * BottomDrawer – ein von unten einfahrendes Sheet-Modal mit abgedunkeltem
 * Hintergrund. Tippen auf den Hintergrund oder das X schließt es. Der Inhalt
 * wird als `children` übergeben; die Höhe wächst mit dem Inhalt bis `maxHeight`.
 */
import { useTheme, useThemedStyles } from "@/src/styles/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type BottomDrawerProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export function BottomDrawer({
  visible,
  onClose,
  title,
  children,
}: BottomDrawerProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles((t) => ({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: t.colors.background,
      borderTopLeftRadius: t.radii.xl,
      borderTopRightRadius: t.radii.xl,
      paddingTop: t.spacing(2),
      maxHeight: "80%",
    },
    grabber: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.colors.tabIconDefault,
      opacity: 0.5,
      marginBottom: t.spacing(2),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: t.spacing(4),
      paddingBottom: t.spacing(2),
      gap: t.spacing(2),
    },
    title: {
      flex: 1,
      color: t.colors.text,
      fontSize: t.typography.sizes.lg,
      fontWeight: t.typography.weights.semibold,
    },
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + 8 }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.grabber} />
          {title ? (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
