import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import useColorScheme from '../../hooks/useColorScheme';

interface OverviewRuleItemProps {
  title: string;
  description: string;
}

const OverviewRuleItem = ({ title, description }: OverviewRuleItemProps) => {
  const colorScheme = useColorScheme();
  return (
    <View
      style={[
        styles.container,
        {
          borderColor: Colors[colorScheme].primary,
          backgroundColor: Colors[colorScheme].secondary,
        },
      ]}
    >
      <View style={styles.tableHead}>
        <Text style={{ fontWeight: 'bold', marginRight: 4 }}>{title}</Text>
      </View>
      <View style={styles.tableRow}>
        <View style={styles.abilities}>
          <Text style={{ textAlign: 'justify' }}>{description}</Text>
        </View>
      </View>
      <View style={[styles.triangle, { backgroundColor: Colors[colorScheme].secondary }]} />
      <View style={[styles.borderCorner, { borderColor: Colors[colorScheme].primary }]} />
    </View>
  );
};

export default OverviewRuleItem;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    paddingHorizontal: Layout.spacing(3),
    paddingBottom: Layout.spacing(2),
    borderRadius: 4,
  },
  tableHead: {
    height: Layout.spacing(5),
    justifyContent: 'center',
    marginTop: 4,
  },
  tableRow: {
    flexDirection: 'column',
  },
  abilities: {
    paddingVertical: 4,
  },
  triangle: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderRightWidth: 12,
    borderTopWidth: 12,
    borderRightColor: 'transparent',
    borderTopColor: 'white',
    transform: [{ rotate: '180deg' }],
  },
  borderCorner: {
    position: 'absolute',
    bottom: -1.5,
    right: 4,
    width: 5,
    height: 16,
    borderRightWidth: 1,
    transform: [{ rotate: '45deg' }],
  },
});
