import { useRosterContext } from "@/src/context/RosterContext";
import { useRosterUnitDetails } from "@/src/hooks/useRosterUnitDetails";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import PointsOverview from "../components/PointsOverview/PointsOverview";
import Abilities from "../components/Sections/Abilities";
import BlockAbility from "../components/Sections/BlockAbility";
import Characteristics from "../components/Sections/Characteristics";
import Keywords from "../components/Sections/Keywords";
import Weapons from "../components/Sections/Weapons";
import Layout from "../styles/theme/constants/Layout";

export default function UnitDetailsScreen() {
  const params = useLocalSearchParams<{
    unitId?: string | string[];
  }>();

  const readParam = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  const unitId = readParam(params.unitId);

  const { selectedRoster, rosterDataLoading, rosterDataError } =
    useRosterContext();
  const unitDetails = useRosterUnitDetails(
    selectedRoster?.roster ?? null,
    unitId ?? null
  );

  const resolvedName = unitDetails?.name ?? "Unit Details";
  const resolvedRole = unitDetails?.role ?? "-";
  const resolvedPoints = unitDetails?.points?.toString() ?? "-";
  const unitCount = unitDetails?.count ?? 1;
  const displayName =
    unitCount > 1 ? `${resolvedName} x${unitCount}` : resolvedName;
  const meleeWeapons =
    unitDetails?.weapons.filter((weapon) => weapon.mode === "melee") ?? [];
  const rangedWeapons =
    unitDetails?.weapons.filter((weapon) => weapon.mode === "ranged") ?? [];
  const otherWeapons =
    unitDetails?.weapons.filter((weapon) => weapon.mode === "other") ?? [];
  const hasMeta = Boolean(resolvedRole || resolvedPoints);
  const hasDetails = Boolean(
    unitDetails?.models.length ||
      unitDetails?.characteristics.length ||
      unitDetails?.weapons.length ||
      unitDetails?.abilities.length ||
      unitDetails?.profileSections.length ||
      unitDetails?.keywords.length ||
      unitDetails?.unitRules.length ||
      unitDetails?.forceRules.length
  );

  const hasInvulerableSave =
    unitDetails?.abilities.find(
      (ability) => ability.name === "Invulnerable Save"
    ) ?? null;
  const hasFeelNoPain =
    unitDetails?.abilities.find((ability) => ability.name === "Feel No Pain") ??
    null;

  return (
    <View style={styles.container}>
      {/* <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{displayName}</Text>
        {hasMeta && (
          <View style={styles.detailsCard}>
            {resolvedRole && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Role</Text>
                <Text style={styles.detailValue}>{resolvedRole}</Text>
              </View>
            )}
            {resolvedPoints && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Points</Text>
                <Text style={styles.detailValue}>{resolvedPoints}</Text>
              </View>
            )}
          </View>
        )}
        {rosterDataError && (
          <Text style={styles.errorText}>{rosterDataError}</Text>
        )}
        {rosterDataLoading && (
          <Text style={styles.loadingText}>Loading unit details...</Text>
        )}
        {!rosterDataLoading && !rosterDataError && !hasDetails && (
          <Text style={styles.emptyText}>
            No additional unit details available.
          </Text>
        )}
        {unitDetails?.models.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Models</Text>
            {unitDetails.models.map((model) => (
              <View key={model.id} style={styles.itemBlock}>
                <Text style={styles.itemTitle}>
                  {model.name}
                  {model.count > 1 ? ` x${model.count}` : ""}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        {/* {unitDetails?.characteristics.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Characteristics</Text>
            {unitDetails.characteristics.map((block) => (
              <View key={block.name} style={styles.itemBlock}>
                <Text style={styles.itemTitle}>
                  {block.name}
                  {block.count > 1 ? ` x${block.count}` : ""}
                </Text>
                <Text style={styles.itemMeta}>
                  {`M ${block.m} | T ${block.t} | Sv ${block.sv} | W ${block.w} | Ld ${block.ld} | OC ${block.oc}`}
                </Text>
              </View>
            ))}
          </View>
        ) : null} 
        {unitDetails?.weapons.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weapons</Text>
            {rangedWeapons.length ? (
              <View style={styles.subSection}>
                <Text style={styles.sectionSubtitle}>Ranged Weapons</Text>
                {rangedWeapons.map((weapon) => {
                  const metaParts = [
                    `Range ${weapon.range}`,
                    weapon.type !== "-" && weapon.type !== ""
                      ? `Type ${weapon.type}`
                      : null,
                    `A ${weapon.a}`,
                    `BS ${weapon.bs}`,
                    `S ${weapon.s}`,
                    `AP ${weapon.ap}`,
                    `D ${weapon.d}`,
                  ].filter((part): part is string => Boolean(part));

                  return (
                    <View key={weapon.id} style={styles.itemBlock}>
                      <Text style={styles.itemTitle}>
                        {weapon.name}
                        {weapon.count != null ? ` x${weapon.count}` : ""}
                      </Text>
                      <Text style={styles.itemMeta}>
                        {metaParts.join(" | ")}
                      </Text>
                      {weapon.abilities !== "-" && weapon.abilities !== "" && (
                        <Text style={styles.itemBody}>
                          {`Abilities: ${weapon.abilities}`}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : null}
            {meleeWeapons.length ? (
              <View style={styles.subSection}>
                <Text style={styles.sectionSubtitle}>Melee Weapons</Text>
                {meleeWeapons.map((weapon) => {
                  const metaParts = [
                    `Range ${weapon.range}`,
                    weapon.type !== "-" && weapon.type !== ""
                      ? `Type ${weapon.type}`
                      : null,
                    `A ${weapon.a}`,
                    `WS ${weapon.bs}`,
                    `S ${weapon.s}`,
                    `AP ${weapon.ap}`,
                    `D ${weapon.d}`,
                  ].filter((part): part is string => Boolean(part));

                  return (
                    <View key={weapon.id} style={styles.itemBlock}>
                      <Text style={styles.itemTitle}>
                        {weapon.name}
                        {weapon.count != null ? ` x${weapon.count}` : ""}
                      </Text>
                      <Text style={styles.itemMeta}>
                        {metaParts.join(" | ")}
                      </Text>
                      {weapon.abilities !== "-" && weapon.abilities !== "" && (
                        <Text style={styles.itemBody}>
                          {`Abilities: ${weapon.abilities}`}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : null}
            {otherWeapons.length ? (
              <View style={styles.subSection}>
                <Text style={styles.sectionSubtitle}>Other Weapons</Text>
                {otherWeapons.map((weapon) => {
                  const metaParts = [
                    `Range ${weapon.range}`,
                    weapon.type !== "-" && weapon.type !== ""
                      ? `Type ${weapon.type}`
                      : null,
                    `A ${weapon.a}`,
                    weapon.bs !== "-" ? `BS/WS ${weapon.bs}` : null,
                    `S ${weapon.s}`,
                    `AP ${weapon.ap}`,
                    `D ${weapon.d}`,
                  ].filter((part): part is string => Boolean(part));

                  return (
                    <View key={weapon.id} style={styles.itemBlock}>
                      <Text style={styles.itemTitle}>
                        {weapon.name}
                        {weapon.count != null ? ` x${weapon.count}` : ""}
                      </Text>
                      <Text style={styles.itemMeta}>
                        {metaParts.join(" | ")}
                      </Text>
                      {weapon.abilities !== "-" && weapon.abilities !== "" && (
                        <Text style={styles.itemBody}>
                          {`Abilities: ${weapon.abilities}`}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        ) : null}
        {unitDetails?.abilities.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Abilities</Text>
            {unitDetails.abilities.map((ability) => (
              <View key={ability.id} style={styles.itemBlock}>
                <Text style={styles.itemTitle}>{ability.name}</Text>
                {ability.description !== "-" && ability.description !== "" && (
                  <Text style={styles.itemBody}>{ability.description}</Text>
                )}
              </View>
            ))}
          </View>
        ) : null}
        {unitDetails?.profileSections.length
          ? unitDetails.profileSections.map((section) => (
              <View key={section.typeName} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.typeName}</Text>
                {section.entries.map((entry) => (
                  <View key={entry.id} style={styles.itemBlock}>
                    <Text style={styles.itemTitle}>{entry.name}</Text>
                    {entry.characteristics.map((characteristic) => {
                      const label = characteristic.name.toLowerCase();
                      const isBody =
                        label === "description" || label === "effect";
                      return (
                        <Text
                          key={`${entry.id}-${characteristic.name}`}
                          style={isBody ? styles.itemBody : styles.itemMeta}
                        >
                          {isBody
                            ? characteristic.value
                            : `${characteristic.name}: ${characteristic.value}`}
                        </Text>
                      );
                    })}
                  </View>
                ))}
              </View>
            ))
          : null}
        {unitDetails?.keywords.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Keywords</Text>
            <Text style={styles.itemBody}>
              {unitDetails.keywords.join(", ")}
            </Text>
          </View>
        ) : null}
        {unitDetails?.unitRules.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Unit Rules</Text>
            {unitDetails.unitRules.map((rule) => (
              <View key={rule.id} style={styles.itemBlock}>
                <Text style={styles.itemTitle}>{rule.name ?? "Rule"}</Text>
                {rule.description && (
                  <Text style={styles.itemBody}>{rule.description}</Text>
                )}
              </View>
            ))}
          </View>
        ) : null}
        {unitDetails?.forceRules.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Force Rules</Text>
            {unitDetails.forceRules.map((rule) => (
              <View key={rule.id} style={styles.itemBlock}>
                <Text style={styles.itemTitle}>{rule.name ?? "Rule"}</Text>
                {rule.description && (
                  <Text style={styles.itemBody}>{rule.description}</Text>
                )}
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView> */}

      <ScrollView>
        <View>
          <PointsOverview
            rosterName={resolvedName}
            force={resolvedRole}
            points={resolvedPoints}
          />
        </View>
        <View style={styles.table}>
          {unitDetails?.characteristics.map((characteristic, index) => (
            <Characteristics
              key={index}
              data={{ ...characteristic, weapons: [] }}
            />
          ))}
        </View>
        <View style={styles.table}>
          {hasInvulerableSave != null && (
            <BlockAbility type="invul" ability={hasInvulerableSave} />
          )}
          {hasFeelNoPain != null && (
            <BlockAbility type="fnp" ability={hasFeelNoPain} />
          )}
        </View>
        <View style={styles.table}>
          <Weapons
            data={unitDetails?.weapons ?? []}
            abilityLookup={unitDetails?.abilityLookup ?? {}}
          />
        </View>
        <View style={styles.table}>
          <Abilities
            abilities={unitDetails?.abilities
              .filter((ability) => ability.name !== "Invulnerable Save")
              .filter((ability) => ability.name !== "Feel No Pain")}
            unitRules={unitDetails?.unitRules}
          />
        </View>
        <View style={styles.table}>
          <Keywords data={unitDetails?.keywords ?? []} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    backgroundColor: "white",
  },
  table: {
    padding: Layout.spacing(4),
    gap: Layout.spacing(4),
  },
  content: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
  },
  detailsCard: {
    width: "100%",
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
  },
  detailRow: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginTop: 16,
  },
  subSection: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.7,
  },
  itemBlock: {
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  itemMeta: {
    fontSize: 13,
    opacity: 0.75,
    marginTop: 2,
  },
  itemBody: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.85,
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  emptyText: {
    marginTop: 12,
    opacity: 0.7,
  },
  errorText: {
    marginTop: 12,
    color: "#b00020",
  },
  button: {
    width: "100%",
    marginBottom: 12,
  },
});
