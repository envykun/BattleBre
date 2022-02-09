import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "../../constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import Layout from "../../constants/Layout";
import useColorScheme from "../../hooks/useColorScheme";
import { StratagemData } from "../../utils/DataTypes";

const Stratagem = ({ title, subTitle, optional, description, descriptionEnd, list, cp, cp2 }: StratagemData) => {
  const colorScheme = useColorScheme();
  return (
    <View style={styles.container}>
      <View style={[styles.titleBar, { backgroundColor: Colors[colorScheme].primary }]}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <Text style={styles.title2}>
          {cp}CP{cp2 && <Text>/{cp2}CP</Text>}
        </Text>
        <View style={styles.triangle} />
      </View>
      <View style={[styles.inner, { borderBottomColor: Colors[colorScheme].primary }]}>
        <View>
          <Text style={styles.subTitle}>{subTitle}</Text>
        </View>
        {optional ? (
          <View>
            <Text style={styles.optional}>{optional}</Text>
          </View>
        ) : null}
        <View style={{ marginTop: 4, paddingVertical: 4 }}>
          <Text style={styles.description}>{description}</Text>

          {list?.length > 0 ? (
            <View style={{ paddingVertical: 6 }}>
              {list.map((li: string, index: number) => (
                <View key={index} style={{ flexDirection: "row", paddingLeft: 8 }}>
                  <Text>{"\u2022"}</Text>
                  <Text style={{ flex: 1, paddingLeft: 4 }}>{li}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {descriptionEnd ? <Text style={styles.description}>{descriptionEnd}</Text> : null}
        </View>
      </View>
    </View>
  );
};

export default Stratagem;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
  },
  titleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    minHeight: 32,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark.text,
    textTransform: "uppercase",
    flex: 1,
  },
  title2: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark.text,
    textTransform: "uppercase",
    marginLeft: 8,
  },
  inner: {
    padding: 4,
    borderBottomWidth: 2,
  },
  description: {},
  subTitle: { fontStyle: "italic", fontWeight: "bold", paddingVertical: 4 },
  optional: { fontStyle: "italic", color: "grey" },
  triangle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderRightWidth: 12,
    borderTopWidth: 10,
    borderRightColor: "transparent",
    borderTopColor: "white",
    transform: [{ rotate: "180deg" }],
  },
});
