import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Layout from "../../constants/Layout";
import Colors from "../../constants/Colors";
import useColorScheme from "../../hooks/useColorScheme";

type Props = {
  data: Array<string>;
};

const Keywords = ({ data }: Props) => {
  const colorScheme = useColorScheme();
  const renderKeywords = (data: Array<string>) => {
    const factionKeywords = data.filter((keyword: string) => keyword.includes("Faction:")).sort();
    const keywords = data.filter((keyword: string) => !keyword.includes("Faction:")).sort();
    return (
      <View style={{ borderWidth: 1, marginBottom: 12, borderColor: Colors[colorScheme].primary, borderRadius: 2 }}>
        <View style={[styles.tableHead, { backgroundColor: Colors[colorScheme].secondary }]}>
          <Text>FACTION KEYWORDS</Text>
        </View>
        <Text style={{ fontWeight: "bold", paddingHorizontal: 12, paddingVertical: 4 }}>
          {factionKeywords.map((keyword: string, index: number) => (
            <Text key={index}>
              {keyword.replace("Faction: ", "")}
              {index !== factionKeywords.length - 1 && ", "}
            </Text>
          ))}
        </Text>
        <View style={[styles.tableHead, { backgroundColor: Colors[colorScheme].secondary }]}>
          <Text>KEYWORDS</Text>
        </View>
        <Text style={{ fontWeight: "bold", paddingHorizontal: 12, paddingVertical: 4 }}>
          {keywords.map((keyword: string, index: number) => (
            <Text key={index}>
              {keyword}
              {index !== keywords.length - 1 && ", "}
            </Text>
          ))}
        </Text>
        <View style={styles.triangle} />
        <View style={[styles.borderCorner, { borderRightColor: Colors[colorScheme].primary }]} />
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>KEYWORDS</Text>
      </View>
      {data.length > 0 ? (
        renderKeywords(data)
      ) : (
        <View>
          <Text>No Keywords.</Text>
        </View>
      )}
    </View>
  );
};

export default Keywords;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
  },
  tableRow2: {
    flexDirection: "row",
    minHeight: Layout.spacing(5),
  },
  title: {
    height: Layout.spacing(6),
    justifyContent: "center",
  },
  titleText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  tableHead: {
    height: Layout.spacing(5),
    justifyContent: "center",
    paddingLeft: 12,
  },
  triangle: {
    position: "absolute",
    bottom: -1.5,
    right: -1.5,
    width: 0,
    height: 0,
    backgroundColor: "white",
    borderStyle: "solid",
    borderRightWidth: 12,
    borderTopWidth: 12,
    borderRightColor: "transparent",
    borderTopColor: "white",
    transform: [{ rotate: "180deg" }],
  },
  borderCorner: {
    position: "absolute",
    bottom: -1.5,
    right: 4,
    width: 5,
    height: 16,
    borderRightWidth: 1,
    transform: [{ rotate: "45deg" }],
  },
});
