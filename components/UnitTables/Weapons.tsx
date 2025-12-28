import React, { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import useColorScheme from '../../hooks/useColorScheme';
import { Weapon } from '../../utils/DataTypes';

interface Props {
  data: Array<Weapon>;
}

const Weapons = ({ data }: Props) => {
  const colorScheme = useColorScheme();
  const renderWeapons = (weapon: Weapon, index: number): ReactElement => (
    <View
      key={index}
      style={{
        borderWidth: 1,
        marginBottom: 12,
        borderColor: Colors[colorScheme].primary,
        borderRadius: 4,
      }}
    >
      <View style={[styles.unitTitle, { backgroundColor: Colors[colorScheme].primary }]}>
        <Text style={styles.unitTitleText}>{weapon.name}</Text>
        <Text style={styles.unitTitleCount}>{weapon.count}x</Text>
      </View>
      <View style={[styles.tableHead, { backgroundColor: Colors[colorScheme].secondary }]}>
        <View style={styles.tableCell2}>
          <Text style={styles.headText}>RANGE</Text>
        </View>
        <View style={styles.tableCell2}>
          <Text style={styles.headText}>TYPE</Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={styles.headText}>S</Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={styles.headText}>AP</Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={styles.headText}>D</Text>
        </View>
      </View>
      <View style={[styles.tableRow, { borderColor: Colors[colorScheme].primary }]}>
        <View style={styles.tableCell2}>
          <Text>{weapon.range}</Text>
        </View>
        <View style={styles.tableCell2}>
          <Text>{weapon.type}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text>{weapon.s}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text>{weapon.ap}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text>{weapon.d}</Text>
        </View>
      </View>
      <View style={[styles.tableRow3, { borderColor: Colors[colorScheme].primary }]}>
        <View style={styles.abilities}>
          <Text>{weapon.ability}</Text>
        </View>
      </View>
      <View style={styles.tableRow2}>
        <View style={styles.abilities}>
          <Text style={{ fontStyle: 'italic', color: 'grey', fontSize: 12 }}>
            {weapon.models?.join(', ')}
          </Text>
        </View>
      </View>
      <View style={styles.triangle} />
      <View style={[styles.borderCorner, { borderRightColor: Colors[colorScheme].primary }]} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>WEAPONS</Text>
      </View>
      {data.length > 0 ? (
        data.map((weapon: Weapon, index: number) => renderWeapons(weapon, index))
      ) : (
        <View>
          <Text>No weapons.</Text>
        </View>
      )}
    </View>
  );
};

export default Weapons;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  tableHead: {
    height: Layout.spacing(5),
    flexDirection: 'row',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    height: Layout.spacing(5),
  },
  tableRow3: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    minHeight: Layout.spacing(5),
  },
  tableRow2: {
    flexDirection: 'row',
    minHeight: Layout.spacing(5),
  },
  tableCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCell2: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headText: {
    fontWeight: 'bold',
  },
  abilities: {
    justifyContent: 'center',
    paddingLeft: 8,
    marginRight: 12,
    paddingVertical: 4,
  },
  title: {
    height: Layout.spacing(6),
    justifyContent: 'center',
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  unitTitle: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing(2),
    height: Layout.spacing(5),
    flexDirection: 'row',
  },
  unitTitleText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  unitTitleCount: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  triangle: {
    position: 'absolute',
    bottom: -1.5,
    right: -1.5,
    width: 0,
    height: 0,
    backgroundColor: 'white',
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
