import { router } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Not Found</Text>
      <Text style={styles.subtitle}>This screen does not exist.</Text>
      <View style={styles.button}>
        <Button title="Go Home" onPress={() => router.replace("/")} />
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    width: "100%",
  },
});
