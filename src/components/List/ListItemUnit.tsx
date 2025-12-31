import { UnitItem } from "@/src/hooks/useRosterUnits";
import { Layout } from "@/src/styles/theme";
import Colors from "@/src/styles/theme/constants/Colors";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Avatar from "../Avatar/Avatar";

interface Props {
  index: string;
  title: string;
  subTitle?: string;
  costs?: string;
  unit: UnitItem;
  onPress: () => void;
}

const ListItemUnit = ({
  index,
  title,
  subTitle,
  costs,
  unit,
  onPress,
}: Props) => {
  const [isDead, setIsDead] = useState<boolean>(false);
  const colorScheme = "light";

  useEffect(() => {
    if (isDead) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [isDead]);

  return (
    <View key={index} style={styles.root}>
      <Pressable
        onPress={isDead ? () => {} : onPress}
        onLongPress={() => setIsDead((prev) => !prev)}
        style={({ pressed }) => [
          styles.card,
          pressed ? styles.rootPressed : null,
        ]}
      >
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text
                style={{
                  fontSize: 10,
                  borderWidth: 1,
                  borderRadius: 50,
                  borderColor: Colors.light.tabIconDefault,
                  paddingVertical: 2,
                  paddingHorizontal: 8,
                  textDecorationLine: isDead ? "line-through" : "none",
                  opacity: isDead ? 0.6 : 1.0,
                  alignSelf: "flex-start",
                }}
              >
                {costs}pts
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  textDecorationLine: isDead ? "line-through" : "none",
                  opacity: isDead ? 0.6 : 1.0,
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "400",
                  color: isDead ? "#d1d1d1" : Colors.light.primary,
                  textDecorationLine: isDead ? "line-through" : "none",
                  opacity: isDead ? 0.6 : 1.0,
                }}
              >
                {subTitle}
              </Text>
            </View>
            <View style={styles.cardHeaderIcons}>
              {isDead ? (
                <Ionicons
                  name="skull-sharp"
                  size={46}
                  color={Colors.default.error}
                />
              ) : (
                <Avatar
                  size={48}
                  rounded
                  title={title.slice(0, 2)}
                  containerStyle={{
                    backgroundColor: Colors[colorScheme].primary,
                    borderWidth: 2,
                  }}
                />
              )}
            </View>
          </View>
          <View style={styles.characteristics}>
            <View style={styles.characteristicsTable}>
              <View style={styles.characteristicsRow}>
                <Text style={[styles.charHeader, styles.charCell]}>M</Text>
                <Text style={[styles.charHeader, styles.charCell]}>T</Text>
                <Text style={[styles.charHeader, styles.charCell]}>Sv</Text>
                <Text style={[styles.charHeader, styles.charCell]}>W</Text>
                <Text style={[styles.charHeader, styles.charCell]}>Ld</Text>
                <Text style={[styles.charHeader, styles.charCell]}>OC</Text>
              </View>
              {unit.characteristics.map((char, index) => (
                <View key={index}>
                  <View style={styles.characteristicsRow}>
                    <Text style={styles.charCell}>{char.m}</Text>
                    <Text style={styles.charCell}>{char.t}</Text>
                    <Text style={styles.charCell}>{char.sv}</Text>
                    <Text style={styles.charCell}>{char.w}</Text>
                    <Text style={styles.charCell}>{char.ld}</Text>
                    <Text style={styles.charCell}>{char.oc}</Text>
                  </View>
                  {unit.characteristics.length > 1 && (
                    <View
                      key={char.name + index}
                      style={styles.characteristicsRow}
                    >
                      <Text style={styles.modelName}>{char.name}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
            {(unit.invulnerableSave || unit.feelNoPain) && (
              <View style={styles.abilities}>
                {unit.invulnerableSave && (
                  <View style={styles.charValue}>
                    <View style={styles.iconWrapper}>
                      <MaterialIcons name="shield" size={46} color="white" />
                      <Text style={styles.centeredValue}>
                        {unit.invulnerableSave}
                      </Text>
                    </View>
                  </View>
                )}
                {unit.feelNoPain && (
                  <View style={styles.charValue}>
                    <View style={styles.iconWrapper}>
                      <FontAwesome6 name="hand-fist" size={46} color="white" />
                      <Text style={styles.centeredValue}>
                        {unit.feelNoPain}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
};

export default ListItemUnit;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: Layout.spacing(4),
    paddingVertical: Layout.spacing(2),
  },
  card: {
    flex: 1,
    borderRadius: Layout.spacing(4),
    padding: Layout.spacing(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 128,
    borderWidth: 1,
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.tabIconDefault,
  },
  cardBody: {
    flex: 1,
    flexDirection: "column",
    gap: Layout.spacing(4),
    height: "100%",
  },
  cardHeader: {
    flexDirection: "row",
    gap: Layout.spacing(2),
    justifyContent: "space-between",
  },
  cardHeaderText: {
    flexDirection: "column",
    gap: Layout.spacing(1),
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  cardHeaderIcons: {
    flexDirection: "column",
    gap: Layout.spacing(1),
  },
  rootPressed: {
    backgroundColor: "#eeeeeeff",
  },
  characteristics: {
    flexDirection: "row",
    gap: Layout.spacing(2),
    borderColor: Colors.light.tabIconDefault,
    borderCurve: "circular",
    borderRadius: Layout.spacing(4),
    backgroundColor: "#efefef62",
    paddingVertical: Layout.spacing(4),
    paddingHorizontal: Layout.spacing(2),
  },
  characteristicsTable: {
    flexDirection: "column",
    flex: 1,
    minWidth: 0,
    gap: Layout.spacing(3),
  },
  characteristicsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.spacing(2),
  },
  charCell: {
    flex: 1,
    textAlign: "center",
  },
  modelName: {
    color: Colors.light.primary,
    fontSize: 10,
    fontStyle: "italic",
    paddingTop: Layout.spacing(1),
  },
  charHeader: {
    fontWeight: "bold",
  },
  charValue: {
    flexDirection: "column",
    gap: Layout.spacing(2),
    alignItems: "center",
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
  abilities: {
    flexDirection: "row",
    gap: Layout.spacing(1),
  },
});
