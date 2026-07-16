import { useTheme, useThemedStyles } from "@/src/styles/theme";
import { useCatalogueData } from "@/src/hooks/useCatalogueData";
import type {
  AvailableSource,
  GalleryEntry,
  UpdateInfo,
} from "@/src/data/battlebre-engine";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function DataManagerScreen() {
  const { theme } = useTheme();
  const {
    installed,
    gallery,
    updates,
    loading,
    busy,
    error,
    refreshGallery,
    checkForUpdates,
    install,
    applyUpdates,
  } = useCatalogueData();
  const [selectedRepo, setSelectedRepo] = useState<GalleryEntry | null>(null);
  const styles = useThemedStyles((t) => ({
    root: { flex: 1, backgroundColor: t.colors.background },
    content: { padding: t.spacing(4), gap: t.spacing(4) },
    sectionTitle: {
      color: t.colors.text,
      fontSize: t.typography.sizes.lg,
      fontWeight: t.typography.weights.semibold,
    },
    card: {
      backgroundColor: t.colors.secondary,
      borderRadius: t.radii.lg,
      padding: t.spacing(3),
      gap: t.spacing(2),
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: t.spacing(2),
      gap: t.spacing(2),
    },
    rowText: { flex: 1, gap: t.spacing(1) },
    label: { color: t.colors.text, fontSize: t.typography.sizes.md },
    sub: {
      color: t.colors.text,
      opacity: 0.65,
      fontSize: t.typography.sizes.sm,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing(2),
      backgroundColor: t.colors.primary,
      paddingVertical: t.spacing(2),
      paddingHorizontal: t.spacing(3),
      borderRadius: t.radii.md,
      alignSelf: "flex-start",
    },
    buttonText: {
      color: t.colors.background,
      fontWeight: t.typography.weights.semibold,
    },
    error: { color: "#c0392b", fontSize: t.typography.sizes.sm },
    empty: {
      color: t.colors.text,
      opacity: 0.6,
      fontSize: t.typography.sizes.sm,
    },
  }));

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: "center" }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Verfügbare Repositories */}
      <Text style={styles.sectionTitle}>Datenquellen</Text>
      <Pressable
        style={styles.button}
        onPress={refreshGallery}
        disabled={busy}
      >
        <Ionicons name="cloud-download-outline" size={18} color={theme.colors.background} />
        <Text style={styles.buttonText}>Gallery laden</Text>
      </Pressable>
      {busy ? <ActivityIndicator color={theme.colors.primary} /> : null}
      {gallery.length > 0 ? (
        <View style={styles.card}>
          {gallery.map((entry) => (
            <Pressable
              key={entry.name}
              style={styles.row}
              onPress={() => {
                setSelectedRepo(entry);
                checkForUpdates(entry);
              }}
            >
              <View style={styles.rowText}>
                <Text style={styles.label}>{entry.description ?? entry.name}</Text>
                <Text style={styles.sub}>{entry.version ?? entry.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* Verfügbare/aktualisierbare Quellen des gewählten Repos */}
      {selectedRepo ? (
        <>
          <Text style={styles.sectionTitle}>
            {selectedRepo.description ?? selectedRepo.name}
          </Text>
          {updates.length === 0 ? (
            <Text style={styles.empty}>Alles aktuell – keine Updates.</Text>
          ) : (
            <>
              <Pressable
                style={styles.button}
                onPress={() => applyUpdates(updates)}
                disabled={busy}
              >
                <Ionicons name="download-outline" size={18} color={theme.colors.background} />
                <Text style={styles.buttonText}>Alle installieren ({updates.length})</Text>
              </Pressable>
              <View style={styles.card}>
                {updates.map((u) => (
                  <UpdateRow
                    key={u.available.id}
                    update={u}
                    onInstall={() => install(u.available)}
                    styles={styles}
                    color={theme.colors.text}
                  />
                ))}
              </View>
            </>
          )}
        </>
      ) : null}

      {/* Installierte Daten */}
      <Text style={styles.sectionTitle}>Installiert</Text>
      {installed.length === 0 ? (
        <Text style={styles.empty}>Noch keine Daten installiert.</Text>
      ) : (
        <View style={styles.card}>
          {installed.map((s) => (
            <View key={s.id} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.label}>{s.name}</Text>
                <Text style={styles.sub}>
                  {s.type === "gamesystem" ? "Spielsystem" : "Katalog"} · rev {s.revision}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function UpdateRow({
  update,
  onInstall,
  styles,
  color,
}: {
  update: UpdateInfo;
  onInstall: () => void;
  styles: any;
  color: string;
}) {
  const src: AvailableSource = update.available;
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.label}>{src.name}</Text>
        <Text style={styles.sub}>
          {update.isNew
            ? `Neu · rev ${src.revision}`
            : `Update · rev ${update.installed?.revision} → ${src.revision}`}
        </Text>
      </View>
      <Pressable onPress={onInstall} hitSlop={8}>
        <Ionicons
          name={update.isNew ? "add-circle-outline" : "refresh-circle-outline"}
          size={24}
          color={color}
        />
      </Pressable>
    </View>
  );
}
