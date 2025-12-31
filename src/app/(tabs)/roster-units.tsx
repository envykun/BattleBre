import ListItemUnit from "@/src/components/List/ListItemUnit";
import { useRosterContext } from "@/src/context/RosterContext";
import { useRosterUnits, type UnitItem } from "@/src/hooks/useRosterUnits";
import { Layout } from "@/src/styles/theme";
import { router } from "expo-router";
import {
  ImageBackground,
  ListRenderItem,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function RosterUnitsScreen() {
  const { selectedRoster, loading, rosterDataLoading, rosterDataError } =
    useRosterContext();
  const isLoading = loading || rosterDataLoading;
  const sections = useRosterUnits(selectedRoster?.roster ?? null);

  const renderItem: ListRenderItem<UnitItem> = ({ item, index }) => (
    <ListItemUnit
      index={item.id}
      title={item.name}
      subTitle={item.role}
      costs={item.points?.toString()}
      unit={item}
      onPress={() => {
        router.push({ pathname: "/unit-details", params: { unitId: item.id } });
      }}
    />
  );
  return (
    <View style={styles.container}>
      <ImageBackground
        resizeMode="cover"
        style={{ width: "100%", height: "100%" }}
        source={require("../../../assets/images/background.jpg")}
        imageStyle={{ opacity: 0.2 }}
      >
        {rosterDataError != null && (
          <Text style={styles.errorText}>Error: {rosterDataError}</Text>
        )}
        <SectionList
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.title}>{title}</Text>
          )}
          renderSectionFooter={() => <View style={styles.separator} />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {isLoading ? "Loading units..." : "No units found."}
            </Text>
          }
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    padding: Layout.spacing(4),
  },
  unitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  unitInfo: {
    flex: 1,
    marginRight: 12,
  },
  unitName: {
    fontSize: 16,
    fontWeight: "600",
  },
  unitRole: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  unitPoints: {
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    width: "100%",
    marginBottom: 12,
  },
  separator: {
    height: 12,
  },
  emptyText: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    textAlign: "center",
    opacity: 0.7,
  },
  errorText: {
    paddingHorizontal: 16,
    paddingTop: 12,
    color: "#b00020",
  },
});
