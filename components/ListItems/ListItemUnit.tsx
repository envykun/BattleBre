import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ListItem } from "react-native-elements";

interface Props {
  index: string;
  title: string;
  onPress: () => void;
}

const ListItemUnit = ({ index, title, onPress }: Props) => {
  return (
    <ListItem
      key={index}
      onPress={onPress}
      bottomDivider
      style={styles.container}
    >
      <ListItem.Content>
        <ListItem.Title>{title}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );
};

export default ListItemUnit;

const styles = StyleSheet.create({
  container: {},
});
