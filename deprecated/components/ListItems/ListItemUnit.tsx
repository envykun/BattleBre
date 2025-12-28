import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar, Icon, ListItem } from 'react-native-elements';
import Colors from '../../constants/Colors';
import useColorScheme from '../../hooks/useColorScheme';

interface Props {
  index: string;
  title: string;
  subTitle?: string;
  costs: string;
  firstItem?: boolean;
  onPress: () => void;
}

const ListItemUnit = ({ index, title, subTitle, costs, firstItem, onPress }: Props) => {
  const [isDead, setIsDead] = useState<boolean>(false);
  const colorScheme = useColorScheme();
  return (
    <ListItem
      key={index}
      onPress={onPress}
      onLongPress={() => setIsDead(!isDead)}
      bottomDivider
      topDivider={firstItem}
      containerStyle={isDead ? styles.container : undefined}
    >
      {isDead ? (
        <Icon type="ionicon" name="skull" size={46} color={Colors.default.error} />
      ) : (
        <Avatar
          size={48}
          rounded
          title={title.slice(0, 2)}
          containerStyle={{ backgroundColor: Colors[colorScheme].primary, borderWidth: 2 }}
        />
      )}
      <ListItem.Content>
        <ListItem.Title
          style={{
            fontSize: 18,
            textDecorationLine: isDead ? 'line-through' : 'none',
            opacity: isDead ? 0.6 : 1.0,
          }}
        >
          {title}
        </ListItem.Title>
        {subTitle && (
          <ListItem.Subtitle
            style={{
              textDecorationLine: isDead ? 'line-through' : 'none',
              opacity: isDead ? 0.6 : 1.0,
            }}
          >
            {subTitle}
          </ListItem.Subtitle>
        )}
      </ListItem.Content>
      <ListItem.Title
        style={{
          textDecorationLine: isDead ? 'line-through' : 'none',
          opacity: isDead ? 0.6 : 1.0,
        }}
      >
        {costs}
      </ListItem.Title>
      <ListItem.Chevron />
    </ListItem>
  );
};

export default ListItemUnit;

const styles = StyleSheet.create({
  container: {},
});
