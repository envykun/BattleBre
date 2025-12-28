import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Divider, ListItem } from 'react-native-elements';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import useColorScheme from '../../hooks/useColorScheme';

interface OverviewRuleItemAccordionProps {
  title: string;
  description: string;
  unit?: string | Array<string>;
  detachmentRule: boolean;
}

const OverviewRuleItemAccordion = ({
  title,
  description,
  unit,
  detachmentRule,
}: OverviewRuleItemAccordionProps) => {
  const colorScheme = useColorScheme();
  const [expanded, setExpanded] = useState<boolean>(false);
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
      <ListItem.Accordion
        containerStyle={{ backgroundColor: Colors[colorScheme].secondary, borderRadius: 4 }}
        isExpanded={expanded}
        onPress={() => setExpanded(!expanded)}
        content={
          <ListItem.Content>
            <ListItem.Title style={{ fontWeight: 'bold' }}>{title}</ListItem.Title>
          </ListItem.Content>
        }
      >
        <Divider style={{ backgroundColor: Colors[colorScheme].primary, height: 1 }} />
        <View style={styles.abilities}>
          <Text style={{ textAlign: 'justify' }}>{description}</Text>
        </View>
      </ListItem.Accordion>
      <Divider style={{ backgroundColor: Colors[colorScheme].primary, height: 1 }} />
      <View style={styles.units}>
        {unit ? (
          Array.isArray(unit) ? (
            unit.every((i: any) => i === undefined) ? (
              <Text style={styles.unitText}>Detachment Rule</Text>
            ) : (
              <Text style={styles.unitText}>{unit.sort().join(', ')}</Text>
            )
          ) : (
            <Text style={styles.unitText}>{unit}</Text>
          )
        ) : detachmentRule ? (
          <Text style={styles.unitText}>Detachment Rule</Text>
        ) : (
          <Text style={styles.unitText}>Force Rule</Text>
        )}
      </View>
      <View style={[styles.triangle, { backgroundColor: Colors[colorScheme].secondary }]} />
      <View style={[styles.borderCorner, { borderColor: Colors[colorScheme].primary }]} />
    </View>
  );
};

export default OverviewRuleItemAccordion;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    paddingBottom: Layout.spacing(2),
    borderRadius: 4,
  },
  units: {
    paddingTop: Layout.spacing(2),
    paddingHorizontal: Layout.spacing(3),
  },
  abilities: {
    padding: Layout.spacing(3),
  },
  unitText: {
    fontStyle: 'italic',
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
