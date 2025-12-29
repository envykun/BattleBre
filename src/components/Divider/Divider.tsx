import { StyleSheet, View } from "react-native";

export default function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  divider: {
    borderWidth: 1,
    width: "100%",
  },
});
