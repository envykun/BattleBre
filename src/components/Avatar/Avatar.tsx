import Colors from "@/src/styles/theme/constants/Colors";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface Props {
  size?: number;
  rounded?: boolean;
  title: string;
  containerStyle?: ViewStyle;
}

export default function Avatar(props: Props) {
  const size = props.size ?? 42;
  const borderRadius = props.rounded ? size / 2 : styles.avatar.borderRadius;
  const titleSize = size / 2;
  return (
    <View
      style={[
        styles.avatar,
        {
          borderRadius,
          height: size,
          width: size,
        },
        props.containerStyle,
      ]}
    >
      <Text style={[styles.title, { fontSize: titleSize }]}>{props.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 100,
    height: 42,
    width: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: Colors["dark"].text,
  },
});
