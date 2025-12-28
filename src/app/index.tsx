import { router } from "expo-router";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const data = [
    { id: "1", title: "Item 1" },
    { id: "2", title: "Item 2" },
    { id: "3", title: "Item 3" },
  ];

  const renderItem = ({ item }: { item: { id: string; title: string } }) => (
    <View id={item.id} style={styles.listItem}>
      <Text>{item.title}</Text>
      <Button
        title="Enter App"
        onPress={() => router.push("/(tabs)/roster-overview")}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <View style={styles.button}>
        <Button title="Open Modal" onPress={() => router.push("/modal")} />
      </View>
      <View>
        <FlatList data={data} renderItem={renderItem} />
      </View>
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
  listItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 54,
    width: "100%",
    borderWidth: 1,
    backgroundColor: "light-gray",
  },
});
