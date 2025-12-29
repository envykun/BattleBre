import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import Divider from "../components/Divider/Divider";
import ListItemRoster from "../components/List/ListItemRoster";
import { RosterMeta, useFetchRosters } from "../hooks/useFetchRosters";

export default function Index() {
  const { rosters, loading, error, addRoster } = useFetchRosters();

  const renderItem = ({ item }: { item: RosterMeta }) => (
    <ListItemRoster {...item} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.status}>
        {loading && <Text>Loading rosters...</Text>}
        {!loading && error && <Text>{error}</Text>}
        {!loading && !error && (
          <Text>{`Rosters loaded: ${rosters?.length ?? 0}`}</Text>
        )}
        <FlatList
          data={rosters ?? []}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <Divider />}
        />
      </View>
      <Button title="Add roster" onPress={addRoster} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    marginTop: 16,
  },
});
