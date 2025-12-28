import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import { Images } from '../../constants/Images';
import Layout from '../../constants/Layout';
import useColorScheme from '../../hooks/useColorScheme';

interface Props {
  rosterName: string;
  force: string;
  points: string;
  cp: string;
  cabal?: string;
}

const PointsOverview = ({ rosterName, force, points, cp, cabal }: Props) => {
  const colorScheme = useColorScheme();
  console.log('NA DU MISSGEBURT', cp);
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{rosterName}</Text>
        <Text style={styles.subTitle}>{force}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 1 }}>
        <View style={styles.unitType}>
          <View style={[styles.unitTypeIcon, { backgroundColor: Colors[colorScheme].primary }]}>
            <Text style={{ fontWeight: 'bold', color: Colors.dark.text }}>CP</Text>
            <View
              style={[
                styles.triangle,
                {
                  backgroundColor: Colors[colorScheme].primary,
                  borderTopColor: Colors[colorScheme].secondary,
                },
              ]}
            />
          </View>
          <View style={[styles.unitTypeText, { backgroundColor: Colors[colorScheme].secondary }]}>
            <View style={[styles.triangle2, { backgroundColor: Colors[colorScheme].secondary }]} />
            <Text style={{ fontWeight: 'bold', color: Colors.light.text }}>{cp}</Text>
          </View>
        </View>
        <View style={styles.unitType}>
          <View style={[styles.unitTypeIcon, { backgroundColor: Colors[colorScheme].primary }]}>
            <Text style={{ fontWeight: 'bold', color: Colors.dark.text }}>PTS</Text>
            <View
              style={[
                styles.triangle,
                {
                  backgroundColor: Colors[colorScheme].primary,
                  borderTopColor: Colors[colorScheme].secondary,
                },
              ]}
            />
          </View>
          <View style={[styles.unitTypeText, { backgroundColor: Colors[colorScheme].secondary }]}>
            <View style={[styles.triangle2, { backgroundColor: Colors[colorScheme].secondary }]} />
            <Text style={{ fontWeight: 'bold', color: Colors.light.text }}>{points}</Text>
          </View>
        </View>
        {cabal && (
          <View style={styles.unitType}>
            <View style={[styles.unitTypeIcon, { backgroundColor: Colors[colorScheme].primary }]}>
              <Text style={{ fontWeight: 'bold', color: Colors.dark.text }}>Cabal</Text>
              <View
                style={[
                  styles.triangle,
                  {
                    backgroundColor: Colors[colorScheme].primary,
                    borderTopColor: Colors[colorScheme].secondary,
                  },
                ]}
              />
            </View>
            <View style={[styles.unitTypeText, { backgroundColor: Colors[colorScheme].secondary }]}>
              <View
                style={[styles.triangle2, { backgroundColor: Colors[colorScheme].secondary }]}
              />
              <Text style={{ fontWeight: 'bold', color: Colors.light.text }}>{cabal}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default PointsOverview;

const styles = StyleSheet.create({
  container: {
    marginTop: Layout.spacing(3),
    marginBottom: Layout.spacing(3),
    marginHorizontal: Layout.spacing(3),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlignVertical: 'center',
  },
  subTitle: {
    fontSize: 14,
    color: 'grey',
    textAlignVertical: 'center',
  },
  unitType: {
    height: Layout.spacing(5) * 2,
    width: Layout.spacing(6),
    marginLeft: 4,
  },
  unitTypeText: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    borderBottomLeftRadius: 4,
  },
  unitTypeIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  triangle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderRightColor: 'transparent',
    transform: [{ rotate: '180deg' }],
  },
  triangle2: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderRightColor: 'transparent',
    borderTopColor: 'white',
    transform: [{ rotate: '180deg' }],
  },
});
