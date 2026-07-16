import { Button, FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "../components/Header/Header";
import ListItemRoster from "../components/List/ListItemRoster";
import { RosterMeta, useFetchRosters } from "../hooks/useFetchRosters";

export default function Index() {
  const { rosters, loading, error, addRoster, loadRosters } = useFetchRosters();
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }: { item: RosterMeta }) => (
    <ListItemRoster {...item} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={rosters ?? []}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
            <Header />
          </View>
        }
        stickyHeaderIndices={[0]}
        refreshing={loading}
        onRefresh={loadRosters}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      />
      <View style={{ paddingBottom: insets.bottom }}>
        <Button title="Add roster" onPress={addRoster} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrapper: { backgroundColor: "#fff" },
});
