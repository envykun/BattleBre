import { Button, FlatList, StyleSheet, View } from "react-native";
import Header from "../components/Header/Header";
import ListItemRoster from "../components/List/ListItemRoster";
import { RosterMeta, useFetchRosters } from "../hooks/useFetchRosters";

export default function Index() {
  const { rosters, loading, error, addRoster, loadRosters } = useFetchRosters();

  const renderItem = ({ item }: { item: RosterMeta }) => (
    <ListItemRoster {...item} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={rosters ?? []}
        renderItem={renderItem}
        ListHeaderComponent={<Header />}
        stickyHeaderIndices={[0]}
        refreshing={loading}
        onRefresh={loadRosters}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      />
      <Button title="Add roster" onPress={addRoster} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
