import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {}

const OverviewRuleItem = (props: Props) => {
  return (
    <View style={styles.container}>
      <Text>This is a Rule Title</Text>
      <Text>This is some Rule Text and Stuff</Text>
      <Text>This is a Rule Title</Text>
    </View>
  );
};

export default OverviewRuleItem;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: 12,
  },
});
