import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  title: string;
  subTitle: string;
  optional?: string;
  description: string;
  cp: string;
}

const Stratagem = ({ title, subTitle, optional, description, cp }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View>
          <Text style={styles.subTitle}>{subTitle}</Text>
        </View>
        {optional && (
          <View>
            <Text style={styles.optional}>{optional}</Text>
          </View>
        )}
        <View style={{ marginTop: 4 }}>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>
      <View style={styles.cp}>
        <Text>{cp}CP</Text>
      </View>
    </View>
  );
};

export default Stratagem;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    position: "relative",
  },
  cp: {
    position: "absolute",
    backgroundColor: "white",
    borderWidth: 1,
    padding: 4,
    borderRadius: 6,
    top: 16,
    left: 6,
  },
  inner: {
    backgroundColor: "grey",
    borderWidth: 2,
    padding: 12,
    //     clipPath:
    //       "polygon(20% 0, 80% 0, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0 80%, 0 20%)",
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {},
  subTitle: { textAlign: "center", fontStyle: "italic" },
  optional: { textAlign: "center", fontStyle: "italic" },
});
