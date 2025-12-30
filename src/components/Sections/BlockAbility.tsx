import { UnitAbility } from "@/src/hooks/useRosterUnitDetails";
import Colors from "@/src/styles/theme/constants/Colors";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  type: "invul" | "fnp";
  ability: UnitAbility;
}

export default function BlockAbility(props: Props) {
  const colorScheme = "light";

  const value = props.ability.description.match(/\d+\+?/)?.[0] ?? "";

  if (props.type === "fnp") {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme].primary },
        ]}
      >
        <Text style={styles.text}>Feel No Pain</Text>
        <View style={styles.iconWrapper}>
          <FontAwesome6 name="hand-fist" size={46} color="white" />
          <Text style={styles.centeredValue}>{value}</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].primary },
      ]}
    >
      <Text style={styles.text}>Invulnerable Save</Text>
      <View style={styles.iconWrapper}>
        <MaterialIcons name="shield" size={46} color="white" />
        <Text style={styles.centeredValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 12,
    height: 56,
    alignItems: "center",
    justifyContent: "space-between",
  },
  text: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  centeredValue: {
    position: "absolute",
    width: 46,
    height: 46,
    lineHeight: 46,
    textAlign: "center",
    color: Colors.light.primary,
    fontWeight: "bold",
  },
  iconWrapper: {
    position: "relative",
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
});
