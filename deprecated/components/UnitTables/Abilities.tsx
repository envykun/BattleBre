import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { Ability, Rule } from '../../utils/DataTypes';
import OverviewRuleItem from '../ListItems/OverviewRuleItem';

interface Props {
  abilities: Array<Ability>;
  unitRules: Array<Rule>;
  forceRules: Array<Rule>;
}

const Abilities = ({ abilities, unitRules, forceRules }: Props) => {
  const renderAbilities = (item: Ability, index: number) => {
    return (
      <View key={index} style={{ marginBottom: 12 }}>
        <OverviewRuleItem title={item.name} description={item.text} />
      </View>
    );
  };
  const renderUnitRules = (item: Rule, index: number) => {
    return (
      <View key={index} style={{ marginBottom: 12 }}>
        <OverviewRuleItem title={item.title} description={item.description} />
      </View>
    );
  };
  const renderForceRules = (item: Rule, index: number) => {
    return (
      <View key={index} style={{ marginBottom: 12 }}>
        <OverviewRuleItem title={item.title} description={item.description} />
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>ABILITIES</Text>
      </View>
      {abilities.length > 0 ? (
        abilities.map((ability: Ability, index: number) => renderAbilities(ability, index))
      ) : (
        <View>
          <Text>No Abilities.</Text>
        </View>
      )}
      <View style={styles.title}>
        <Text style={styles.titleText}>RULES</Text>
      </View>
      {unitRules.length > 0 ? (
        unitRules.map((rule: Rule, index: number) => renderUnitRules(rule, index))
      ) : (
        <View>
          <Text>No Rules.</Text>
        </View>
      )}
      <View style={styles.title}>
        <Text style={styles.titleText}>FORCE RULES</Text>
      </View>
      {forceRules.length > 0 ? (
        forceRules.map((rule: Rule, index: number) => renderForceRules(rule, index))
      ) : (
        <View>
          <Text>No Force Rules.</Text>
        </View>
      )}
    </View>
  );
};

export default Abilities;

const styles = StyleSheet.create({
  container: {
    marginTop: -12,
  },
  title: {
    height: Layout.spacing(6),
    justifyContent: 'center',
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});
