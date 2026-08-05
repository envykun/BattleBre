import {
  AddableEntry,
  AddableForce,
  BattleBreEngine,
  RosterView,
  SelectionView,
  ValidationReport,
} from "@/src/data/battlebre-engine";
import { BottomDrawer } from "@/src/components/BottomDrawer/BottomDrawer";
import { useRosterContext } from "@/src/context/RosterContext";
import { useCatalogueData } from "@/src/hooks/useCatalogueData";
import { useTheme, useThemedStyles } from "@/src/styles/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Phase = "setup" | "force" | "build";

export default function CreateRosterScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { installed, loading, readInstalledXml } = useCatalogueData();
  const { saveCreatedRoster, setSelectedRosterId } = useRosterContext();

  const engineRef = useRef<BattleBreEngine | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup-State
  const [name, setName] = useState("");
  const [gameSystemId, setGameSystemId] = useState<string | null>(null);
  const [catalogueIds, setCatalogueIds] = useState<string[]>([]);

  // Build-State (aus der Engine gezogen)
  const [forces, setForces] = useState<AddableForce[]>([]);
  const [state, setState] = useState<RosterView | null>(null);
  const [report, setReport] = useState<ValidationReport | null>(null);

  // "Hinzufügen"-Drawer (Einheiten)
  const [addTarget, setAddTarget] = useState<string | null>(null);
  const [addOptions, setAddOptions] = useState<AddableEntry[]>([]);

  // Drawer-Sichtbarkeit für Setup-Auswahlen + Force-Auswahl
  const [systemDrawer, setSystemDrawer] = useState(false);
  const [catalogueDrawer, setCatalogueDrawer] = useState(false);
  const [forceDrawer, setForceDrawer] = useState(false);

  const gameSystems = useMemo(
    () => installed.filter((s) => s.type === "gamesystem"),
    [installed]
  );
  // Kataloge desselben Repos wie das gewählte Spielsystem (verhindert das
  // Mischen inkompatibler Editionen). Ohne Auswahl: alle Kataloge.
  const catalogues = useMemo(() => {
    const cats = installed.filter((s) => s.type === "catalogue");
    const selectedGs = installed.find((s) => s.id === gameSystemId);
    if (!selectedGs) return cats;
    return cats.filter((c) => c.repoId === selectedGs.repoId);
  }, [installed, gameSystemId]);

  const styles = useThemedStyles((t) => ({
    root: { flex: 1, backgroundColor: t.colors.background },
    content: { padding: t.spacing(4), gap: t.spacing(3) },
    sectionTitle: {
      color: t.colors.text,
      fontSize: t.typography.sizes.lg,
      fontWeight: t.typography.weights.semibold,
    },
    label: { color: t.colors.text, fontSize: t.typography.sizes.md },
    sub: { color: t.colors.text, opacity: 0.65, fontSize: t.typography.sizes.sm },
    input: {
      color: t.colors.text,
      backgroundColor: t.colors.secondary,
      borderRadius: t.radii.md,
      paddingHorizontal: t.spacing(3),
      paddingVertical: t.spacing(2),
      fontSize: t.typography.sizes.md,
    },
    card: {
      backgroundColor: t.colors.secondary,
      borderRadius: t.radii.lg,
      padding: t.spacing(3),
      gap: t.spacing(1),
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: t.spacing(2),
      paddingHorizontal: t.spacing(2),
      borderRadius: t.radii.md,
      backgroundColor: t.colors.background,
      gap: t.spacing(2),
    },
    rowSelected: { borderWidth: 1, borderColor: t.colors.primary },
    rowText: { flex: 1, gap: t.spacing(1) },
    primaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: t.spacing(2),
      backgroundColor: t.colors.primary,
      paddingVertical: t.spacing(3),
      borderRadius: t.radii.md,
    },
    primaryButtonText: {
      color: t.colors.background,
      fontWeight: t.typography.weights.semibold,
      fontSize: t.typography.sizes.md,
    },
    disabled: { opacity: 0.4 },
    error: { color: "#c0392b", fontSize: t.typography.sizes.sm },
    warn: { color: "#b9770e", fontSize: t.typography.sizes.sm },
    costHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: t.spacing(3),
      paddingVertical: t.spacing(2),
    },
    costValue: {
      color: t.colors.text,
      fontSize: t.typography.sizes.md,
      fontWeight: t.typography.weights.semibold,
    },
    selectionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing(2),
      paddingVertical: t.spacing(1),
    },
    countBtn: {
      width: 28,
      height: 28,
      borderRadius: t.radii.sm,
      backgroundColor: t.colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    drawerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: t.spacing(3),
      paddingHorizontal: t.spacing(4),
      gap: t.spacing(2),
    },
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
    placeholder: {
      color: t.colors.tabIconDefault,
      fontSize: t.typography.sizes.md,
    },
  }));

  // --- Setup → Engine bauen -------------------------------------------------
  const canStart = name.trim().length > 0 && gameSystemId && catalogueIds.length > 0;

  const startBuilding = async () => {
    if (!canStart) return;
    setBusy(true);
    setError(null);
    try {
      const gstXml = await readInstalledXml(gameSystemId!);
      const catXmls = await Promise.all(
        catalogueIds.map((id) => readInstalledXml(id))
      );
      const engine = BattleBreEngine.fromXml(gstXml, catXmls);
      engine.createRoster({ name: name.trim() });
      engineRef.current = engine;
      setForces(engine.listForceEntries());
      setPhase("force");
      setForceDrawer(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Laden der Daten.");
    } finally {
      setBusy(false);
    }
  };

  const refresh = () => {
    const engine = engineRef.current;
    if (!engine) return;
    setState(engine.getState());
    setReport(engine.validate());
  };

  const chooseForce = (force: AddableForce) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.addForce(force.forceEntryId, force.catalogueId);
    setForceDrawer(false);
    setPhase("build");
    refresh();
  };

  const openAdd = (target: string) => {
    const engine = engineRef.current;
    if (!engine) return;
    setAddTarget(target);
    setAddOptions(engine.getAddableEntries(target).filter((e) => !e.hidden));
  };

  const addSelection = (entryId: string) => {
    const engine = engineRef.current;
    if (!engine || !addTarget) return;
    engine.addSelection(addTarget, entryId);
    setAddTarget(null);
    setAddOptions([]);
    refresh();
  };

  const changeCount = (instanceId: string, delta: number, current: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    const next = current + delta;
    if (next <= 0) engine.removeSelection(instanceId);
    else engine.setCount(instanceId, next);
    refresh();
  };

  const save = async () => {
    const engine = engineRef.current;
    if (!engine) return;
    setBusy(true);
    setError(null);
    try {
      const roster = engine.toRoster();
      const meta = await saveCreatedRoster(roster);
      setSelectedRosterId(meta.id);
      router.replace({
        pathname: "/(tabs)/roster-overview",
        params: { rosterId: meta.id },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern.");
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: "center" }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  // --- Render nach Phase ----------------------------------------------------
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {phase === "setup" && (
          <SetupPhase
            styles={styles}
            theme={theme}
            name={name}
            setName={setName}
            gameSystems={gameSystems}
            catalogues={catalogues}
            gameSystemId={gameSystemId}
            catalogueIds={catalogueIds}
            onOpenSystem={() => setSystemDrawer(true)}
            onOpenCatalogues={() => setCatalogueDrawer(true)}
          />
        )}

        {phase === "force" && (
          <>
            <Text style={styles.sectionTitle}>Fraktion / Force wählen</Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() => setForceDrawer(true)}
            >
              <Ionicons name="list" size={18} color={theme.colors.background} />
              <Text style={styles.primaryButtonText}>Force auswählen</Text>
            </Pressable>
          </>
        )}

        {phase === "build" && state && (
          <BuildPhase
            styles={styles}
            theme={theme}
            state={state}
            report={report}
            onOpenAdd={openAdd}
            onChangeCount={changeCount}
          />
        )}
      </ScrollView>

      {/* Footer-Aktion je Phase */}
      <View style={{ paddingBottom: insets.bottom, padding: 16 }}>
        {phase === "setup" && (
          <Pressable
            style={[styles.primaryButton, (!canStart || busy) && styles.disabled]}
            onPress={startBuilding}
            disabled={!canStart || busy}
          >
            {busy ? (
              <ActivityIndicator color={theme.colors.background} />
            ) : (
              <Text style={styles.primaryButtonText}>Weiter</Text>
            )}
          </Pressable>
        )}
        {phase === "build" && (
          <Pressable
            style={[styles.primaryButton, busy && styles.disabled]}
            onPress={save}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={theme.colors.background} />
            ) : (
              <Text style={styles.primaryButtonText}>Roster speichern</Text>
            )}
          </Pressable>
        )}
      </View>

      {/* Spielsystem-Drawer (Setup, Einzelauswahl) */}
      <BottomDrawer
        visible={systemDrawer}
        onClose={() => setSystemDrawer(false)}
        title="Spielsystem wählen"
      >
        <ScrollView>
          {gameSystems.map((gs) => (
            <Pressable
              key={gs.id}
              style={styles.drawerRow}
              onPress={() => {
                setGameSystemId(gs.id);
                setCatalogueIds([]); // Kataloge zurücksetzen (anderes System)
                setSystemDrawer(false);
              }}
            >
              <Text style={styles.label}>{gs.name}</Text>
              {gameSystemId === gs.id ? (
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      </BottomDrawer>

      {/* Katalog-Drawer (Setup, Mehrfachauswahl) */}
      <BottomDrawer
        visible={catalogueDrawer}
        onClose={() => setCatalogueDrawer(false)}
        title="Kataloge wählen"
      >
        <ScrollView>
          {catalogues.length === 0 ? (
            <Text style={[styles.sub, { paddingHorizontal: 16, paddingBottom: 12 }]}>
              Kein Katalog für dieses Spielsystem installiert.
            </Text>
          ) : (
            catalogues.map((cat) => {
              const selected = catalogueIds.includes(cat.id);
              return (
                <Pressable
                  key={cat.id}
                  style={styles.drawerRow}
                  onPress={() =>
                    setCatalogueIds((prev) =>
                      prev.includes(cat.id)
                        ? prev.filter((c) => c !== cat.id)
                        : [...prev, cat.id]
                    )
                  }
                >
                  <Text style={styles.label}>{cat.name}</Text>
                  <Ionicons
                    name={selected ? "checkbox" : "square-outline"}
                    size={20}
                    color={selected ? theme.colors.primary : theme.colors.tabIconDefault}
                  />
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </BottomDrawer>

      {/* Force-Drawer */}
      <BottomDrawer
        visible={forceDrawer}
        onClose={() => setForceDrawer(false)}
        title="Fraktion / Force wählen"
      >
        <ScrollView>
          {forces.map((f) => (
            <Pressable
              key={`${f.forceEntryId}:${f.catalogueId}`}
              style={styles.drawerRow}
              onPress={() => chooseForce(f)}
            >
              <View style={styles.rowText}>
                <Text style={styles.label}>{f.name}</Text>
                <Text style={styles.sub}>{f.catalogueName}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
            </Pressable>
          ))}
        </ScrollView>
      </BottomDrawer>

      {/* Hinzufügen-Drawer (Einheiten) */}
      <BottomDrawer
        visible={addTarget !== null}
        onClose={() => setAddTarget(null)}
        title="Hinzufügen"
      >
        <ScrollView>
          {addOptions.length === 0 ? (
            <Text style={[styles.sub, { paddingHorizontal: 16, paddingBottom: 12 }]}>
              Keine Einträge verfügbar.
            </Text>
          ) : (
            addOptions.map((opt) => (
              <Pressable
                key={opt.id}
                style={styles.drawerRow}
                onPress={() => addSelection(opt.id)}
              >
                <View style={styles.rowText}>
                  <Text style={styles.label}>{opt.name}</Text>
                  {opt.costs.length > 0 ? (
                    <Text style={styles.sub}>
                      {opt.costs.map((c) => `${c.value} ${c.name}`).join(" · ")}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name="add-circle-outline" size={22} color={theme.colors.primary} />
              </Pressable>
            ))
          )}
        </ScrollView>
      </BottomDrawer>
    </View>
  );
}

// --- Setup-Phase -------------------------------------------------------------
function SetupPhase({
  styles,
  theme,
  name,
  setName,
  gameSystems,
  catalogues,
  gameSystemId,
  catalogueIds,
  onOpenSystem,
  onOpenCatalogues,
}: any) {
  if (gameSystems.length === 0) {
    return (
      <View style={{ gap: 12 }}>
        <Text style={styles.sectionTitle}>Keine Daten installiert</Text>
        <Text style={styles.sub}>
          Zum Erstellen wird mindestens ein Spielsystem und ein Katalog benötigt.
        </Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/data-manager")}
        >
          <Ionicons name="cloud-download-outline" size={18} color={theme.colors.background} />
          <Text style={styles.primaryButtonText}>Daten verwalten</Text>
        </Pressable>
      </View>
    );
  }

  const selectedSystem = gameSystems.find((gs: any) => gs.id === gameSystemId);
  const catCount = catalogueIds.length;
  const catLabel =
    catCount === 0
      ? "Kataloge wählen…"
      : catalogues
          .filter((c: any) => catalogueIds.includes(c.id))
          .map((c: any) => c.name)
          .join(", ");

  return (
    <>
      <Text style={styles.sectionTitle}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Mein Roster"
        placeholderTextColor={theme.colors.tabIconDefault}
      />

      <Text style={styles.sectionTitle}>Spielsystem</Text>
      <Pressable style={styles.field} onPress={onOpenSystem}>
        <Text style={selectedSystem ? styles.label : styles.placeholder}>
          {selectedSystem ? selectedSystem.name : "Spielsystem wählen…"}
        </Text>
        <Ionicons name="chevron-down" size={20} color={theme.colors.text} />
      </Pressable>

      <Text style={styles.sectionTitle}>Kataloge</Text>
      <Pressable
        style={[styles.field, !gameSystemId && styles.disabled]}
        onPress={gameSystemId ? onOpenCatalogues : undefined}
        disabled={!gameSystemId}
      >
        <Text
          style={[catCount > 0 ? styles.label : styles.placeholder, { flex: 1 }]}
          numberOfLines={1}
        >
          {catLabel}
        </Text>
        <Ionicons name="chevron-down" size={20} color={theme.colors.text} />
      </Pressable>
    </>
  );
}

// --- Build-Phase -------------------------------------------------------------
function BuildPhase({ styles, theme, state, report, onOpenAdd, onChangeCount }: any) {
  const s: RosterView = state;
  return (
    <>
      {/* Kosten-Kopf */}
      <View style={styles.costHeader}>
        {s.costTotals.map((c) => (
          <Text key={c.typeId} style={styles.costValue}>
            {c.value}
            {c.limit !== undefined ? ` / ${c.limit}` : ""} {c.name}
          </Text>
        ))}
      </View>

      {/* Validierung */}
      {report?.errors?.map((e: any, i: number) => (
        <Text key={`e${i}`} style={styles.error}>
          ⚠ {e.message}
        </Text>
      ))}
      {report?.warnings?.map((w: any, i: number) => (
        <Text key={`w${i}`} style={styles.warn}>
          {w.message}
        </Text>
      ))}

      {s.forces.map((force) => (
        <View key={force.id} style={{ gap: 8 }}>
          <View style={styles.selectionRow}>
            <Text style={[styles.sectionTitle, { flex: 1 }]}>{force.name}</Text>
            <Pressable style={styles.countBtn} onPress={() => onOpenAdd(force.id)}>
              <Ionicons name="add" size={18} color={theme.colors.primary} />
            </Pressable>
          </View>
          <View style={styles.card}>
            {force.selections.length === 0 ? (
              <Text style={styles.sub}>Noch keine Einheiten. Mit + hinzufügen.</Text>
            ) : (
              force.selections.map((sel) => (
                <SelectionRow
                  key={sel.instanceId}
                  styles={styles}
                  theme={theme}
                  selection={sel}
                  depth={0}
                  onOpenAdd={onOpenAdd}
                  onChangeCount={onChangeCount}
                />
              ))
            )}
          </View>
        </View>
      ))}
    </>
  );
}

function SelectionRow({ styles, theme, selection, depth, onOpenAdd, onChangeCount }: any) {
  const sel: SelectionView = selection;
  const pts = sel.costs.find((c) => c.name.toLowerCase() === "pts")?.value;
  return (
    <View style={{ paddingLeft: depth * 12 }}>
      <View style={styles.selectionRow}>
        <View style={styles.rowText}>
          <Text style={styles.label}>
            {sel.number > 1 ? `${sel.number}× ` : ""}
            {sel.name}
          </Text>
          {pts !== undefined ? <Text style={styles.sub}>{pts} pts</Text> : null}
        </View>
        <Pressable style={styles.countBtn} onPress={() => onChangeCount(sel.instanceId, -1, sel.number)}>
          <Ionicons name="remove" size={18} color={theme.colors.text} />
        </Pressable>
        <Pressable style={styles.countBtn} onPress={() => onChangeCount(sel.instanceId, 1, sel.number)}>
          <Ionicons name="add" size={18} color={theme.colors.text} />
        </Pressable>
        <Pressable style={styles.countBtn} onPress={() => onOpenAdd(sel.instanceId)}>
          <Ionicons name="options-outline" size={18} color={theme.colors.primary} />
        </Pressable>
      </View>
      {sel.children.map((child) => (
        <SelectionRow
          key={child.instanceId}
          styles={styles}
          theme={theme}
          selection={child}
          depth={depth + 1}
          onOpenAdd={onOpenAdd}
          onChangeCount={onChangeCount}
        />
      ))}
    </View>
  );
}
