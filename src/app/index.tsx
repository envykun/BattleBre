import { router } from "expo-router";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { RosterMeta, useFetchRosters } from "../hooks/useFetchRosters";

export default function Index() {
  const { rosters, loading, error } = useFetchRosters();

  const renderItem = ({ item }: { item: RosterMeta }) => (
    <View id={item.id} style={styles.listItem}>
      <Text>{item.name}</Text>
      <Button
        title="Enter App"
        onPress={() =>
          router.push({
            pathname: "/(tabs)/roster-overview",
            params: { rosterId: item.id },
          })
        }
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.status}>
        {loading && <Text>Loading rosters...</Text>}
        {!loading && error && <Text>{error}</Text>}
        {!loading && !error && (
          <Text>{`Rosters loaded: ${rosters?.length ?? 0}`}</Text>
        )}
        <FlatList data={rosters ?? []} renderItem={renderItem} />
      </View>
      <Button title="Add roster" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 24,
  },
  button: {
    width: "100%",
    marginBottom: 12,
  },
  status: {
    marginBottom: 16,
  },
  listItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 128,
    width: "100%",
    borderWidth: 1,
    backgroundColor: "light-gray",
  },
});
