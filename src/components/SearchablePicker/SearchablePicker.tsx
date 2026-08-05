/**
 * SearchablePicker – ein Auswahlfeld, das ein Modal mit Suchfeld und
 * scrollbarer, gefilterter Trefferliste öffnet. Gedacht für lange Listen
 * (z. B. ~130 Spielsysteme), bei denen eine Inline-Liste unhandlich wäre.
 */
import { useTheme, useThemedStyles } from "@/src/styles/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type SearchablePickerProps<T> = {
  /** Die auswählbaren Elemente. */
  items: T[];
  /** Aktuell gewähltes Element (oder null). */
  selected: T | null;
  /** Callback bei Auswahl. */
  onSelect: (item: T) => void;
  /** Haupttext eines Eintrags. */
  labelOf: (item: T) => string;
  /** Optionaler Untertext eines Eintrags (z. B. Version). */
  subtitleOf?: (item: T) => string | undefined;
  /** Stabiler Key eines Eintrags. */
  keyOf: (item: T) => string;
  /** Platzhalter im geschlossenen Feld, wenn nichts gewählt ist. */
  placeholder?: string;
  /** Platzhalter im Suchfeld. */
  searchPlaceholder?: string;
  /** Titel des Modals. */
  title?: string;
};

export function SearchablePicker<T>({
  items,
  selected,
  onSelect,
  labelOf,
  subtitleOf,
  keyOf,
  placeholder = "Auswählen…",
  searchPlaceholder = "Suchen…",
  title = "Auswählen",
}: SearchablePickerProps<T>) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const hay = `${labelOf(it)} ${subtitleOf?.(it) ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, labelOf, subtitleOf]);

  const styles = useThemedStyles((t) => ({
    field: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: t.colors.secondary,
      borderRadius: t.radii.md,
      paddingHorizontal: t.spacing(3),
      paddingVertical: t.spacing(3),
      gap: t.spacing(2),
    },
    fieldText: { flex: 1, gap: t.spacing(1) },
    fieldLabel: { color: t.colors.text, fontSize: t.typography.sizes.md },
    placeholder: {
      color: t.colors.tabIconDefault,
      fontSize: t.typography.sizes.md,
    },
    fieldSub: {
      color: t.colors.text,
      opacity: 0.6,
      fontSize: t.typography.sizes.sm,
    },
    modalRoot: { flex: 1, backgroundColor: t.colors.background },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing(2),
      paddingHorizontal: t.spacing(4),
      paddingVertical: t.spacing(3),
    },
    modalTitle: {
      flex: 1,
      color: t.colors.text,
      fontSize: t.typography.sizes.lg,
      fontWeight: t.typography.weights.semibold,
    },
    search: {
      color: t.colors.text,
      backgroundColor: t.colors.secondary,
      borderRadius: t.radii.md,
      marginHorizontal: t.spacing(4),
      paddingHorizontal: t.spacing(3),
      paddingVertical: t.spacing(2),
      fontSize: t.typography.sizes.md,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: t.spacing(4),
      paddingVertical: t.spacing(3),
      gap: t.spacing(2),
    },
    rowText: { flex: 1, gap: t.spacing(1) },
    rowLabel: { color: t.colors.text, fontSize: t.typography.sizes.md },
    rowSub: {
      color: t.colors.text,
      opacity: 0.6,
      fontSize: t.typography.sizes.sm,
    },
    separator: {
      height: 1,
      backgroundColor: t.colors.secondary,
      marginHorizontal: t.spacing(4),
    },
    empty: {
      color: t.colors.text,
      opacity: 0.6,
      fontSize: t.typography.sizes.sm,
      padding: t.spacing(4),
    },
  }));

  const selectedLabel = selected ? labelOf(selected) : null;
  const selectedSub = selected ? subtitleOf?.(selected) : undefined;

  return (
    <>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <View style={styles.fieldText}>
          {selectedLabel ? (
            <>
              <Text style={styles.fieldLabel}>{selectedLabel}</Text>
              {selectedSub ? (
                <Text style={styles.fieldSub}>{selectedSub}</Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.placeholder}>{placeholder}</Text>
          )}
        </View>
        <Ionicons name="chevron-down" size={20} color={theme.colors.text} />
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={[styles.modalRoot, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={8}>
              <Ionicons name="close" size={26} color={theme.colors.text} />
            </Pressable>
          </View>
          <TextInput
            style={styles.search}
            value={query}
            onChangeText={setQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={theme.colors.tabIconDefault}
            autoCorrect={false}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={keyOf}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.empty}>Kein Treffer für „{query}“.</Text>
            }
            contentContainerStyle={{ paddingBottom: insets.bottom }}
            renderItem={({ item }) => {
              const isSelected = selected != null && keyOf(item) === keyOf(selected);
              const sub = subtitleOf?.(item);
              return (
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}>{labelOf(item)}</Text>
                    {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
                  </View>
                  {isSelected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={theme.colors.primary}
                    />
                  ) : null}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </>
  );
}
