import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FAB } from "react-native-elements";

const AddButton = ({ title, onPress }: FABProps) => {
  return (
    // <View>
    <FAB
      visible={true}
      icon={{ name: "add", color: "white" }}
      size="small"
      onPress={onPress}
    />
  );
};

export default AddButton;

const styles = StyleSheet.create({});
