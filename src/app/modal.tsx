import { router } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal</Text>
      <View style={styles.button}>
        <Button title="Close" onPress={() => router.back()} />
      </View>
      <View style={styles.button}>
        <Button
          title="Go to Tab One"
          onPress={() => router.push("/(tabs)/tab-one")}
        />
      </View>
      <View style={styles.button}>
        <Button title="Back to Home" onPress={() => router.dismissTo("/")} />
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
});
