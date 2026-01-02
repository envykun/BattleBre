import Colors from "@/src/styles/theme/constants/Colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  value: string;
}

export default function Pill({ value }: Props) {
  return (
    <View>
      <Text
        style={{
          fontSize: 10,
          borderWidth: 1,
          borderRadius: 50,
          borderColor: Colors.light.tabIconDefault,
          paddingVertical: 2,
          paddingHorizontal: 8,
          alignSelf: "flex-start",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({});
