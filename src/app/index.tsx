import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
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
      <View>
        <Text>BattleBre</Text>
        <Ionicons
          name="settings-sharp"
          size={24}
          color="black"
          onPress={() => router.push("/settings")}
        />
      </View>
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
        <Button title="Add roster" onPress={addRoster} />
      </View>
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
