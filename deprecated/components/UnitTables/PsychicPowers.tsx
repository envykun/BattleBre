import React, { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import useColorScheme from '../../hooks/useColorScheme';
import { Psychic, PsychicPower } from '../../utils/DataTypes';

interface Props {
  data: Psychic | undefined;
}

const PsychicPowers = ({ data }: Props) => {
  const colorScheme = useColorScheme();
  const renderPsy = (psy: PsychicPower, index: number): ReactElement => (
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
        <Text style={styles.unitTitleText}>{psy.name}</Text>
      </View>
      <View style={[styles.tableHead, { backgroundColor: Colors[colorScheme].secondary }]}>
        <View style={styles.tableCell}>
          <Text style={styles.headText}>WARP CHARGE</Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={styles.headText}>RANGE</Text>
        </View>
      </View>
      <View style={[styles.tableRow, { borderColor: Colors[colorScheme].primary }]}>
        <View style={styles.tableCell}>
          <Text>{psy.warp}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text>{psy.range}</Text>
        </View>
      </View>
      <View style={styles.tableRow2}>
        <View style={styles.abilities}>
          <Text>{psy.details}</Text>
        </View>
      </View>
      <View style={styles.triangle} />
      <View style={[styles.borderCorner, { borderRightColor: Colors[colorScheme].primary }]} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>PSYKER</Text>
      </View>
      <View
        style={{
          borderWidth: 1,
          marginBottom: 12,
          borderColor: Colors[colorScheme].primary,
          borderRadius: 4,
        }}
      >
        <View style={[styles.unitTitle, { backgroundColor: Colors[colorScheme].primary }]}>
          <Text style={styles.unitTitleText}>{data?.name}</Text>
        </View>
        <View style={[styles.tableHead, { backgroundColor: Colors[colorScheme].secondary }]}>
          <View style={styles.tableCell}>
            <Text style={styles.headText}>CAST</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.headText}>DENY</Text>
          </View>
          <View style={styles.tableCell2}>
            <Text style={styles.headText}>OTHER</Text>
          </View>
        </View>
        <View style={[styles.tableRow, { borderColor: Colors[colorScheme].primary }]}>
          <View style={styles.tableCell}>
            <Text>{data?.cast}</Text>
          </View>
          <View style={styles.tableCell}>
            <Text>{data?.deny}</Text>
          </View>
          <View style={styles.tableCell2}>
            <Text>{data?.other}</Text>
          </View>
        </View>
        <View style={styles.tableRow2}>
          <View style={styles.abilities}>
            <Text>{data?.powers}</Text>
          </View>
        </View>
        <View style={styles.triangle} />
        <View style={[styles.borderCorner, { borderRightColor: Colors[colorScheme].primary }]} />
      </View>
      <View style={styles.title}>
        <Text style={styles.titleText}>PSYCHIC POWERS</Text>
      </View>
      {data?.psychicPowers.map((psy: PsychicPower, index: number) => renderPsy(psy, index))}
    </View>
  );
};

export default PsychicPowers;

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
    justifyContent: 'center',
    paddingLeft: Layout.spacing(2),
    height: Layout.spacing(5),
  },
  unitTitleText: {
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
