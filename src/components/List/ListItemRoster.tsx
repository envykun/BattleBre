import { RosterMeta } from "@/src/hooks/useFetchRosters";
import Colors from "@/src/styles/theme/constants/Colors";
import Layout from "@/src/styles/theme/constants/Layout";
import AntDesign from "@expo/vector-icons/AntDesign";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

type ListItemRosterProps = RosterMeta & {
  onDelete?: (roster: RosterMeta) => void;
  onSecondaryAction?: (roster: RosterMeta) => void;
};

export default function ListItemRoster({
  onDelete,
  onSecondaryAction,
  ...rosterMeta
}: ListItemRosterProps) {
  const handleOpen = () =>
    router.push({
      pathname: "/(tabs)/roster-overview",
      params: { rosterId: rosterMeta.id },
    });

  const handleDelete = () => {
    onDelete?.(rosterMeta);
  };

  // const handleSecondary = () => {
  //   onSecondaryAction?.(rosterMeta);
  // };

  return (
    <View style={styles.root}>
      <View style={styles.outerView}>
        <ReanimatedSwipeable
          containerStyle={{ borderRadius: Layout.spacing(4) }}
          // renderLeftActions={() => (
          //   <View style={[styles.action, styles.actionSecondary]}>
          //     <Pressable onPress={handleSecondary} style={styles.actionButton}>
          //       <Text style={styles.actionText}>Details</Text>
          //     </Pressable>
          //   </View>
          // )}
          renderRightActions={() => (
            <View style={[styles.action, styles.actionDelete]}>
              <Pressable onPress={handleDelete} style={styles.actionButton}>
                <SimpleLineIcons
                  name="trash"
                  size={32}
                  color={Colors.default.error}
                />
              </Pressable>
            </View>
          )}
          overshootFriction={8}
          // friction={2}
        >
          <Pressable
            key={rosterMeta.id}
            onPress={handleOpen}
            style={({ pressed }) => [
              // TODO: add a small delay on the pressed style, so that it does not fire when swiping
              styles.card,
              pressed ? styles.rootPressed : null,
            ]}
          >
            <View style={styles.cardBody}>
              <View style={styles.cardBodyLeft}>
                <View style={styles.cardHeader}>
                  <Text style={{ fontSize: 24, fontWeight: "600" }}>
                    {rosterMeta.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      borderWidth: 1,
                      borderRadius: 50,
                      borderColor: Colors.light.tabIconDefault,
                      paddingVertical: 2,
                      paddingHorizontal: 8,
                    }}
                  >
                    {rosterMeta.points} | 1000
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "400",
                    color: Colors.light.primary,
                  }}
                >
                  {rosterMeta.faction}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#bebebeff",
                    fontStyle: "italic",
                    marginTop: 24,
                  }}
                >
                  {`last updated ${rosterMeta.lastUpdated}`}
                </Text>
              </View>
              <AntDesign name="apple" size={54} color="black" />
            </View>
          </Pressable>
        </ReanimatedSwipeable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: Layout.spacing(4),
    paddingVertical: Layout.spacing(2),
  },
  outerView: {
    borderRadius: Layout.spacing(4),
  },
  card: {
    flex: 1,
    borderRadius: Layout.spacing(4),
    padding: Layout.spacing(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 128,
    borderWidth: 1,
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.tabIconDefault,
  },
  cardBody: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Layout.spacing(2),
    height: "100%",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.spacing(2),
  },
  cardBodyLeft: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  rootPressed: {
    backgroundColor: "#eeeeeeff",
  },
  action: {
    justifyContent: "center",
    alignItems: "center",
    width: 96,
    borderRadius: Layout.spacing(4),
  },
  actionDelete: {
    // backgroundColor: "#D64045",
  },
  actionSecondary: {
    backgroundColor: "#2D7DD2",
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
