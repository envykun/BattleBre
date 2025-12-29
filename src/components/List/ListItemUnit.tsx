import { Layout } from "@/src/styles/theme";
import Colors from "@/src/styles/theme/constants/Colors";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Avatar from "../Avatar/Avatar";

interface Props {
  index: string;
  title: string;
  subTitle?: string;
  costs?: string;
  firstItem?: boolean;
  onPress: () => void;
}

const ListItemUnit = ({
  index,
  title,
  subTitle,
  costs,
  firstItem,
  onPress,
}: Props) => {
  const [isDead, setIsDead] = useState<boolean>(false);
  const colorScheme = "light";

  return (
    <Pressable
      key={index}
      onPress={onPress}
      onLongPress={() => setIsDead(!isDead)}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
    >
      {isDead ? (
        <Ionicons name="skull-sharp" size={46} color={Colors.default.error} />
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
      <View style={styles.innerContainer}>
        <View style={styles.textContainer}>
          <Text
            style={{
              fontSize: 22,
              textDecorationLine: isDead ? "line-through" : "none",
              opacity: isDead ? 0.6 : 1.0,
            }}
          >
            {title}
          </Text>
          {subTitle && (
            <Text
              style={{
                textDecorationLine: isDead ? "line-through" : "none",
                opacity: isDead ? 0.6 : 1.0,
                color: "#5a5a5aff",
              }}
            >
              {subTitle}
            </Text>
          )}
        </View>
        <Text
          style={{
            fontSize: 18,
            textDecorationLine: isDead ? "line-through" : "none",
            opacity: isDead ? 0.6 : 1.0,
          }}
        >
          {costs}pts
        </Text>
      </View>
      <Entypo name="chevron-small-right" size={24} color="#d1d1d1ff" />
    </Pressable>
  );
};

export default ListItemUnit;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d1d1ff",
    padding: Layout.spacing(4),
    backgroundColor: "white",
    gap: Layout.spacing(4),
  },
  containerPressed: {
    backgroundColor: "#e6e6e6",
  },
  innerContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.spacing(4),
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
});
