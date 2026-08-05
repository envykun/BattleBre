import { SearchablePicker } from "@/src/components/SearchablePicker/SearchablePicker";
import { useTheme, useThemedStyles } from "@/src/styles/theme";
import { useCatalogueData } from "@/src/hooks/useCatalogueData";
import type { GalleryEntry } from "@/src/data/battlebre-engine";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function DataManagerScreen() {
  const { theme } = useTheme();
  const {
    installed,
    gallery,
    loading,
    busy,
    error,
    progress,
    refreshGallery,
    installRepo,
    installGithubRepo,
    uninstall,
  } = useCatalogueData();
  const [selectedRepo, setSelectedRepo] = useState<GalleryEntry | null>(null);
  const [githubRepo, setGithubRepo] = useState("BSData/wh40k-11e");

  const startGithubInstall = () => {
    const [owner, repo] = githubRepo.trim().split("/");
    if (owner && repo) installGithubRepo(owner, repo);
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert("Löschen?", `„${name}“ von diesem Gerät entfernen?`, [
      { text: "Abbrechen", style: "cancel" },
      { text: "Löschen", style: "destructive", onPress: () => uninstall(id) },
    ]);
  };

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
    input: {
      color: t.colors.text,
      backgroundColor: t.colors.secondary,
      borderRadius: t.radii.md,
      paddingHorizontal: t.spacing(3),
      paddingVertical: t.spacing(2),
      fontSize: t.typography.sizes.md,
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
      <Pressable style={styles.button} onPress={refreshGallery} disabled={busy}>
        <Ionicons name="cloud-download-outline" size={18} color={theme.colors.background} />
        <Text style={styles.buttonText}>Gallery laden</Text>
      </Pressable>

      {busy && !progress ? <ActivityIndicator color={theme.colors.primary} /> : null}

      {gallery.length > 0 ? (
        <SearchablePicker
          items={gallery}
          selected={selectedRepo}
          onSelect={setSelectedRepo}
          keyOf={(e) => e.name}
          labelOf={(e) => e.description ?? e.name}
          subtitleOf={(e) => e.version ?? undefined}
          placeholder="Spielsystem wählen…"
          searchPlaceholder="Spielsystem suchen…"
          title="Spielsystem wählen"
        />
      ) : null}

      {/* Gewähltes Repo: ganzes System installieren */}
      {selectedRepo ? (
        <>
          <Text style={styles.sectionTitle}>
            {selectedRepo.description ?? selectedRepo.name}
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => installRepo(selectedRepo)}
            disabled={busy}
          >
            <Ionicons name="download-outline" size={18} color={theme.colors.background} />
            <Text style={styles.buttonText}>Ganzes Spielsystem installieren</Text>
          </Pressable>
          {progress ? (
            <View style={styles.row}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.sub}>
                {progress.total > 0
                  ? `Lädt ${progress.done}/${progress.total} Dateien…`
                  : "Index wird geladen…"}
              </Text>
            </View>
          ) : (
            <Text style={styles.sub}>
              Lädt das Spielsystem und alle zugehörigen Kataloge.
            </Text>
          )}
        </>
      ) : null}

      {/* Aus GitHub-Repo laden (BSData-JSON-Format, z. B. wh40k-11e) */}
      <Text style={styles.sectionTitle}>Aus GitHub-Repo laden</Text>
      <Text style={styles.sub}>
        Für neuere BSData-Repos im JSON-Format, die (noch) nicht in der Gallery
        sind – z. B. die aktuelle Edition. Format: owner/repo.
      </Text>
      <TextInput
        style={styles.input}
        value={githubRepo}
        onChangeText={setGithubRepo}
        placeholder="BSData/wh40k-11e"
        placeholderTextColor={theme.colors.tabIconDefault}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable style={styles.button} onPress={startGithubInstall} disabled={busy}>
        <Ionicons name="logo-github" size={18} color={theme.colors.background} />
        <Text style={styles.buttonText}>Repo installieren</Text>
      </Pressable>
      {progress ? (
        <View style={styles.row}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.sub}>
            {progress.total > 0
              ? `Lädt ${progress.done}/${progress.total} Dateien…`
              : "Dateiliste wird geladen…"}
          </Text>
        </View>
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
              <Pressable
                onPress={() => confirmDelete(s.id, s.name)}
                hitSlop={8}
                accessibilityLabel={`${s.name} löschen`}
              >
                <Ionicons name="trash-outline" size={20} color="#c0392b" />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
