import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Avatar, ListItem } from "react-native-elements";
import Colors from "../../constants/Colors";
import useColorScheme from "../../hooks/useColorScheme";

interface Props {
  index: string;
  title: string;
  subTitle?: string;
  costs: string;
  firstItem?: boolean;
  onPress: () => void;
}

const ListItemUnit = ({ index, title, subTitle, costs, firstItem, onPress }: Props) => {
  const colorScheme = useColorScheme();
  return (
    <ListItem key={index} onPress={onPress} bottomDivider topDivider={firstItem} style={styles.container}>
      <Avatar
        size={48}
        rounded
        title={title.slice(0, 2)}
        containerStyle={{ backgroundColor: Colors[colorScheme].primary, borderWidth: 2 }}
      />
      <ListItem.Content>
        <ListItem.Title style={{ fontSize: 18 }}>{title}</ListItem.Title>
        {subTitle && <ListItem.Subtitle>{subTitle}</ListItem.Subtitle>}
      </ListItem.Content>
      <ListItem.Title>{costs}</ListItem.Title>
      <ListItem.Chevron />
    </ListItem>
  );
};

export default ListItemUnit;

const styles = StyleSheet.create({
  container: {},
});
