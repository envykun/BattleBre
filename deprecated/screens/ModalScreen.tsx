import React, { useState } from 'react';
import { useContext } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Image,
  Button,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Divider } from 'react-native-elements';
import { Text, View } from '../components/Themed';
import Abilities from '../components/UnitTables/Abilities';
import CharacteristicsTable from '../components/UnitTables/CharacteristicsTable';
import Keywords from '../components/UnitTables/Keywords';
import PsychicPowers from '../components/UnitTables/PsychicPowers';
import Weapons from '../components/UnitTables/Weapons';
import Colors from '../constants/Colors';
import { Images } from '../constants/Images';
import Layout from '../constants/Layout';
import { DataContext } from '../hooks/DataContext';
import useColorScheme from '../hooks/useColorScheme';
import { Ability, Characteristics, Psychic, Rule, Unit, Weapon } from '../utils/DataTypes';
import { useHeaderHeight } from '@react-navigation/elements';

export default function ModalScreen({ route, navigation }: any) {
  const { context } = useContext(DataContext);
  const unit: Unit = route.params.unit;
  const characteristics: Array<Characteristics> = unit.characteristics;
  const abilities: Array<Ability> = unit.abilities || [];
  const weapons: Array<Weapon> = unit.weapons || [];
  const isPsyker: boolean = unit.psychic !== undefined;
  const psychic: Psychic | undefined = unit.psychic;
  const keywords: Array<string> = unit.keywords;
  const unitRules: Array<Rule> = unit.rules || [];
  const forceRules: Array<Rule> = context.forceRules || [];
  const points: string = unit.costs.replace('pts', '');

  const [showMenu, setShowMenu] = useState<boolean>(false);

  const colorScheme = useColorScheme();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setShowMenu(true)}>
          <View
            style={{
              width: useHeaderHeight() / 2,
              height: useHeaderHeight() / 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              source={Images[route.params?.unit.type]}
              resizeMode="center"
              style={{ width: '110%', height: '110%', tintColor: 'black' }}
            />
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleScroll = (ref: any) => {
    setShowMenu(false);
    this.scrollViewRef.scrollTo({
      y: ref.y,
      animated: true,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        ref={(ref) => (this.scrollViewRef = ref)}
        scrollsToTop
      >
        <View
          style={styles.header}
          onLayout={(event) => (this.backToTop = event.nativeEvent.layout)}
        >
          <View style={{ justifyContent: 'center', flex: 1 }}>
            <Text numberOfLines={1} style={styles.title}>
              {unit.name}
            </Text>
            <Text style={styles.subTitle}>({unit.type})</Text>
          </View>
          <View style={styles.unitType}>
            <View style={[styles.unitTypeIcon, { backgroundColor: Colors[colorScheme].primary }]}>
              <Text style={{ color: Colors.dark.text }}>PTS</Text>
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
              <Text style={{ fontWeight: 'bold', color: Colors.light.text }}>{points}</Text>
            </View>
          </View>
        </View>
        <View style={styles.table}>
          {characteristics.map((char, index) => {
            return index === characteristics.length - 1 ? (
              <CharacteristicsTable key={index} data={char} />
            ) : (
              <View key={index} style={{ marginBottom: Layout.spacing(3) }}>
                <CharacteristicsTable data={char} />
              </View>
            );
          })}
        </View>
        {isPsyker && (
          <View style={styles.table}>
            <PsychicPowers data={psychic} />
          </View>
        )}
        <View
          style={styles.table}
          onLayout={(event) => (this.weaponLayout = event.nativeEvent.layout)}
        >
          <Weapons data={weapons} />
        </View>
        <View
          style={styles.table}
          onLayout={(event) => (this.abilityLayout = event.nativeEvent.layout)}
        >
          <Abilities abilities={abilities} unitRules={unitRules} forceRules={forceRules} />
        </View>
        <View
          style={styles.table}
          onLayout={(event) => (this.keywordLayout = event.nativeEvent.layout)}
        >
          <Keywords data={keywords} />
        </View>
      </ScrollView>
      <Modal transparent visible={showMenu} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.popupMenu}>
          <TouchableOpacity onPress={() => handleScroll(this.backToTop)}>
            <View style={styles.popupMenuLink}>
              <Text>Back to top</Text>
            </View>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity onPress={() => handleScroll(this.weaponLayout)}>
            <View style={styles.popupMenuLink}>
              <Text>Weapons</Text>
            </View>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity onPress={() => handleScroll(this.abilityLayout)}>
            <View style={styles.popupMenuLink}>
              <Text>Abilities</Text>
            </View>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity onPress={() => handleScroll(this.rulesLayout)}>
            <View style={styles.popupMenuLink}>
              <Text>Rules</Text>
            </View>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity onPress={() => handleScroll(this.forceRulesLayout)}>
            <View style={styles.popupMenuLink}>
              <Text>Force Rules</Text>
            </View>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity onPress={() => handleScroll(this.keywordLayout)}>
            <View style={styles.popupMenuLinkLast}>
              <Text>Keywords</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  header: {
    height: Layout.spacing(6),
    flexDirection: 'row',
    marginTop: Layout.spacing(4),
    marginBottom: Layout.spacing(4),
    justifyContent: 'space-between',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  subTitle: {
    fontSize: 14,
    color: 'grey',
    textTransform: 'uppercase',
  },
  table: {
    marginTop: 12,
  },
  unitType: {
    height: Layout.spacing(5) * 2,
    width: Layout.spacing(5) + 10,
    marginLeft: Layout.spacing(2),
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
  popupMenu: {
    alignSelf: 'flex-end',
    elevation: 3,
    paddingHorizontal: Layout.spacing(2),
    borderRadius: 4,
    marginRight: Layout.spacing(3),
    marginTop: Layout.spacing(4),
  },
  popupMenuLink: {
    height: 50,
    paddingHorizontal: Layout.spacing(4),
    justifyContent: 'center',
  },
  popupMenuLinkLast: {
    height: 50,
    paddingHorizontal: Layout.spacing(4),
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
