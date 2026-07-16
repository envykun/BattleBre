<?xml version="1.0" encoding="utf-8"?>
<gameSystem id="gs-mini" name="Mini 40k" revision="1" battleScribeVersion="2.03" xmlns="http://www.battlescribe.net/schema/gameSystemSchema">
  <costTypes>
    <costType id="pts" name="pts" defaultCostLimit="-1"/>
    <costType id="CP" name="CP" defaultCostLimit="-1"/>
  </costTypes>
  <profileTypes>
    <profileType id="pt-unit" name="Unit">
      <characteristicTypes>
        <characteristicType id="c-m" name="M"/>
        <characteristicType id="c-ws" name="WS"/>
        <characteristicType id="c-bs" name="BS"/>
        <characteristicType id="c-s" name="S"/>
        <characteristicType id="c-t" name="T"/>
        <characteristicType id="c-w" name="W"/>
        <characteristicType id="c-a" name="A"/>
        <characteristicType id="c-ld" name="Ld"/>
        <characteristicType id="c-sv" name="Save"/>
      </characteristicTypes>
    </profileType>
    <profileType id="pt-weapon" name="Weapon">
      <characteristicTypes>
        <characteristicType id="w-range" name="Range"/>
        <characteristicType id="w-type" name="Type"/>
        <characteristicType id="w-s" name="S"/>
        <characteristicType id="w-ap" name="AP"/>
        <characteristicType id="w-d" name="D"/>
        <characteristicType id="w-abil" name="Abilities"/>
      </characteristicTypes>
    </profileType>
  </profileTypes>
  <categoryEntries>
    <categoryEntry id="cat-hq" name="HQ"/>
    <categoryEntry id="cat-troops" name="Troops"/>
  </categoryEntries>
  <forceEntries>
    <forceEntry id="fe-patrol" name="Patrol Detachment"/>
  </forceEntries>
</gameSystem>
