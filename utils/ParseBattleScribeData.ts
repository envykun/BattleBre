import { X2jOptions, XMLParser } from "fast-xml-parser";
import JSZip from "jszip";
import _ from "lodash";
import { DataExtractorType } from "../hooks/DataContext";
import { Ability, Characteristics, DetachmentRule, Model, Psychic, PsychicPower, RosterCosts, Rule, Unit, Weapon } from "./DataTypes";
import {
  BS_Category,
  BS_Characteristic,
  BS_Cost,
  BS_Costs,
  BS_Force,
  BS_Profile,
  BS_Rule,
  BS_Selection,
  CostType,
  ProfileType,
  SelectionType,
  UnitCharacteristicType,
  WeaponCharacteristicType,
  XmlData,
} from "./models/DataModels";

async function checkIfValid(data: string): Promise<boolean> {
  // const xml2JSON = parseXML(data);

  return new Promise((resolve) => {
    // if (Object.keys(xml2JSON).length === 0 && xml2JSON.constructor === Object) {
    //   console.log("THIS IS THE DATA", xml2JSON);
    //   throw new Error("Parsing file not possible.");
    // }
    resolve(false);
  });
}

const unzip = async (file: string): Promise<string> => {
  // if (file.charAt(0) !== "P") {
  //   console.error("NOT WORKING");
  //   return file;
  // } else {
  const jszip = new JSZip();
  const zip = await jszip.loadAsync(file, { base64: true });
  return zip.file(/[^/]+\.ros/)[0].async("string"); // Get roster files that are in the root
  // }
};

async function getForce(data: string, isZip: boolean): Promise<DataExtractorType> {
  let xml2JSON;

  if (isZip) {
    const unzipRoster = await unzip(data);
    xml2JSON = parseXML(unzipRoster);
  } else {
    xml2JSON = parseXML(data);
  }
  const detachments: Array<BS_Force> = getDetachments(xml2JSON);

  const forceRules: Array<Rule> = getForceRules(detachments);
  const unitData: Array<Unit> = getSelections(detachments);
  const rosterCost: RosterCosts = parseRosterCosts(xml2JSON);

  return { unitData, rosterCost, forceRules };
}

const options: Partial<X2jOptions> = {
  attributeNamePrefix: "@_",
  ignoreAttributes: false,
  numberParseOptions: {
    leadingZeros: false,
    hex: false,
    skipLike: /\+[0-9]+/,
  },
};

function parseXML(xmldata: string) {
  let parser = new XMLParser(options);
  let doc = parser.parse(xmldata);
  return doc;
}

function getDetachments(data: XmlData): Array<BS_Force> {
  return normalizeToArray(data.roster.forces.force);
} // DONE

function getForceRules(detachment: Array<BS_Force>): Array<Rule> {
  const rules: Array<Rule> = detachment
    .map((detach) => {
      return normalizeToArray<BS_Rule>(detach.rules?.rule).map((rule: BS_Rule) => {
        const desiredRule: Rule = {
          id: rule["@_id"],
          title: rule["@_name"],
          description: rule.description,
          detachmentRule: false,
        };
        return desiredRule;
      });
    })
    .flat();
  return [...new Map(rules.map((r) => [r.id, r])).values()];
} // DONE

function parseRosterCosts(data: XmlData): RosterCosts {
  const rosterData = normalizeToArray<BS_Cost>(data.roster.costs.cost);
  const forces = getDetachments(data);
  const factionName = Array.isArray(forces) ? forces[0]["@_catalogueName"] : forces["@_catalogueName"];
  const hasCabal = rosterData
    .find((r) => r["@_name"] === CostType.CABAL)
    ?.["@_value"].toString()
    .slice(0, -2);
  return {
    faction: factionName,
    points:
      rosterData
        .find((r) => r["@_name"] === CostType.PTS)
        ?.["@_value"].toString()
        .slice(0, -2) ?? "0",
    cp:
      rosterData
        .find((r) => r["@_name"] === CostType.CP)
        ?.["@_value"].toString()
        .slice(0, -2) ?? "0",
    cabal: hasCabal,
  };
} // DONE

function getForceSelections(force: BS_Force): Array<DetachmentRule> {
  const forceSelections: Array<DetachmentRule> = findAllByKey<BS_Force, BS_Selection>(force, "selection")
    .filter(
      (selection: BS_Selection) =>
        selection["@_type"] === SelectionType.UPGRADE &&
        normalizeToArray<BS_Category>(selection.categories?.category).some((category) => category["@_name"] === "Configuration")
    )
    .flatMap((selection) => findAllByKey<BS_Selection, BS_Selection>(selection, "selection").filter((select) => !!select.profiles))
    .map((selection) => {
      const profile = normalizeToArray<BS_Profile>(selection.profiles?.profile)[0];
      const characteristic = normalizeToArray<BS_Characteristic>(profile?.characteristics.characteristic)[0];
      const description = characteristic?.["#text"];
      const parsedRule: Rule = {
        id: profile["@_id"],
        title: profile["@_name"],
        description: description,
        detachmentRule: false,
      };
      const detachmentRule: DetachmentRule = { title: selection["@_name"], abilities: parsedRule };
      return detachmentRule;
    });
  return forceSelections;
} // DONE

function getSelections(forces: Array<BS_Force>): Array<Unit> {
  const allUnits: Array<Unit> = forces.flatMap((force, index) => {
    const detachmentRules: Array<DetachmentRule> = getForceSelections(force);
    const selections: Array<BS_Selection> = normalizeToArray<BS_Selection>(force.selections?.selection);
    return detachmentRules.length > 0
      ? parseUnits(selections, `${index + 1}. ${force["@_name"]}: ${detachmentRules[0].title}`, detachmentRules[0].abilities)
      : parseUnits(selections, `${index + 1}. ${force["@_name"]}`);
  });
  return allUnits;
} // DONE

function getUnitType(unit: BS_Selection): string {
  const categories = unit.categories?.category;
  const primary = Array.isArray(categories) ? categories.find((category: any) => category["@_primary"] === "true") : categories;
  let unitType: string = "NaN";
  if (primary) {
    unitType = primary["@_name"];
  }
  return unitType;
} // DONE

function parseUnits(force: Array<BS_Selection>, detachmentName: string, detachmentRules?: Rule): Array<Unit> {
  return force
    .filter(
      (selection) =>
        selection["@_type"] === SelectionType.MODEL ||
        selection["@_type"] === SelectionType.UNIT ||
        (selection["@_type"] === SelectionType.UPGRADE && "profiles" in selection)
    )
    .map((model) => createUnitFromData(model, detachmentName, model["@_type"], detachmentRules));
} // DONE

function createUnitFromData(unit: BS_Selection, detachmentName: string, type: SelectionType, detachmentRules?: Rule): Unit {
  const unitPsyker = parsePsyker(unit);
  const unitPsychicPowers = parsePsychicPowers(unit, type);

  const models = parseModels(unit);
  const chars = countDublicateCharacteristics(models.flatMap((char) => char.characteristics));
  const weps = countDublicateWeapons(models.flatMap((char) => char.weapons));

  const newUnit: Unit = {
    id: Math.random() + "::" + unit["@_name"],
    name: unit["@_name"],
    type: getUnitType(unit),
    keywords: parseKeywords(unit),
    detachment: detachmentName,
    characteristics: chars as Array<Characteristics>,
    weapons: weps as Array<Weapon>,
    abilities: parseAbilities(unit),
    psychic: getPsyker(unitPsyker, unitPsychicPowers),
    rules: detachmentRules ? parseUnitRules(unit).concat(detachmentRules) : parseUnitRules(unit),
    costs: parseUnitCosts(unit),
  };
  return newUnit;
}

function characteristicFromModel(model: BS_Selection, weapons: Array<string>): Array<Characteristics> {
  const unitProfiles = normalizeToArray<BS_Profile>(model.profiles?.profile).filter(
    (profile) => profile["@_typeName"] === ProfileType.UNIT
  );
  const modelCount = model["@_number"];
  return unitProfiles.map((profile) => {
    const characteristic = normalizeToArray<BS_Characteristic>(profile.characteristics.characteristic);
    const modelCharacteristic: Characteristics = {
      name: profile["@_name"],
      m: characteristic.find((c) => c["@_name"] === UnitCharacteristicType.MOVE)?.["#text"] ?? "-",
      ws: characteristic.find((c) => c["@_name"] === UnitCharacteristicType.WEAPON_SKILL)?.["#text"] ?? "-",
      bs: characteristic.find((c) => c["@_name"] === UnitCharacteristicType.BALISTIC_SKILL)?.["#text"] ?? "-",
      s: characteristic.find((c) => c["@_name"] === UnitCharacteristicType.STRENGTH)?.["#text"] ?? "-",
      t: characteristic.find((c) => c["@_name"] === UnitCharacteristicType.TOUGHNESS)?.["#text"] ?? "-",
      w: characteristic.find((c) => c["@_name"] === UnitCharacteristicType.WOUNDS)?.["#text"] ?? "-",
      a: characteristic.find((c) => c["@_name"] === UnitCharacteristicType.ATTACKS)?.["#text"] ?? "-",
      ld: characteristic.find((c) => c["@_name"] === UnitCharacteristicType.LEADERSHIP)?.["#text"] ?? "-",
      sv: characteristic.find((c) => c["@_name"] === UnitCharacteristicType.SAVE)?.["#text"] ?? "-",
      weapons: weapons,
      count: modelCount,
    };
    return modelCharacteristic;
  });
} // DONE

function parseModels(unit: BS_Selection, characteristic?: Array<Characteristics>): Array<Model> {
  const unitSelections = normalizeToArray<BS_Selection>(unit.selections?.selection);
  const unitProfiles = normalizeToArray<BS_Profile>(unit.profiles?.profile);
  if (unit["@_type"] === SelectionType.MODEL || unit["@_type"] === SelectionType.UPGRADE) {
    if (unit["@_type"] === SelectionType.UPGRADE && !unitProfiles.some((profile) => profile["@_typeName"] === ProfileType.UNIT)) return [];
    const weapons = parseWeapons(unitSelections, unit["@_name"]);
    const characteristics = characteristicFromModel(
      unit,
      weapons.map((weapon) => weapon.name)
    );
    const model: Model = {
      characteristics:
        characteristics.length > 0 ? characteristics : characteristic ? [{ ...characteristic[0], count: unit["@_number"] }] : [],
      weapons: weapons,
    };
    return [model];
  }
  if (unit["@_type"] === SelectionType.UNIT) {
    if (unitProfiles.some((profile) => profile["@_typeName"] === ProfileType.UNIT)) {
      const characteristic = characteristicFromModel(unit, []);
      return unitSelections.flatMap((model) => parseModels(model, characteristic));
    } else {
      return unitSelections.flatMap((model) => parseModels(model));
    }
  }
  return [];
}

function parseUpgrades(unit: BS_Selection): Array<any> {
  let allUpgrades = [];
  const unitUpgrades = new Array(unit.selections?.selection).flat(Infinity).filter((upgrade: any) => upgrade["@_type"] === "upgrade");
  const deeperUnitUpgrades = new Array(unit.selections?.selection)
    .flat(Infinity)
    .map((selection: any) =>
      "selections" in selection
        ? new Array(selection.selections.selection).flat(Infinity).filter((upgrade: any) => upgrade["@_type"] === "upgrade")
        : []
    )
    .flat(Infinity);
  allUpgrades = unitUpgrades.concat(deeperUnitUpgrades);
  return allUpgrades;
}

function parseAbilities(unit: BS_Selection): Array<Ability> {
  let allAbilities: Array<Ability> = [];
  const unitProfile = "profiles" in unit ? new Array(unit.profiles?.profile).flat(Infinity) : [];
  const profileAbilities = unitProfile
    .filter((ability: any) => ability["@_typeName"] === "Abilities")
    .map((upgrade: any): Ability => {
      return { name: upgrade["@_name"], text: upgrade.characteristics.characteristic["#text"] };
    });
  const abilitiesFromUpgrades = parseUpgrades(unit)
    .filter((upgrade: any) => "profiles" in upgrade && upgrade.profiles.profile["@_typeName"] === "Abilities")
    .map((upgrade: any): Ability => {
      const ability = upgrade.profiles.profile;
      return { name: ability["@_name"], text: ability.characteristics.characteristic["#text"] };
    });
  allAbilities = [...new Map(profileAbilities.concat(abilitiesFromUpgrades).map((unit: any) => [unit.name, unit])).values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  return allAbilities;
}

function parseWeapons(unitSelections: Array<BS_Selection>, modelName: string): Array<Weapon> {
  return unitSelections
    .filter((selection) => selection["@_type"] === SelectionType.UPGRADE)
    .flatMap((upgrade) => {
      let deeperWeapons: Array<Weapon> = [];
      const upgradeCount = upgrade["@_number"];
      if (upgrade.selections?.selection) {
        const deeperUnitSelections = normalizeToArray<BS_Selection>(upgrade.selections.selection);
        deeperWeapons = parseWeapons(deeperUnitSelections, modelName);
      }
      const profiles = normalizeToArray<BS_Profile>(upgrade.profiles?.profile);
      const weapons = profiles.filter((profile) => profile["@_typeName"] === ProfileType.WEAPON);
      return weapons
        .map((weapon) => {
          const characteristic = normalizeToArray<BS_Characteristic>(weapon.characteristics.characteristic);
          const newWeapon: Weapon = {
            name: weapon["@_name"],
            range: characteristic.find((c) => c["@_name"] === WeaponCharacteristicType.RANGE)?.["#text"] ?? "-",
            type: characteristic.find((c) => c["@_name"] === WeaponCharacteristicType.TYPE)?.["#text"] ?? "-",
            s: characteristic.find((c) => c["@_name"] === WeaponCharacteristicType.STRENGTH)?.["#text"] ?? "-",
            ap: characteristic.find((c) => c["@_name"] === WeaponCharacteristicType.ARMOR_PENETRATION)?.["#text"] ?? "-",
            d: characteristic.find((c) => c["@_name"] === WeaponCharacteristicType.DAMAGE)?.["#text"] ?? "-",
            ability: characteristic.find((c) => c["@_name"] === WeaponCharacteristicType.ABILITIES)?.["#text"] ?? "-",
            count: upgradeCount,
            models: [modelName], // OVERRIDES EACH TIME -- FIX IT!
          };
          return newWeapon;
        })
        .concat(deeperWeapons);
    });
}

function parseUnitRules(unit: BS_Selection): Array<Rule> {
  let rulesData: any = "rules" in unit && unit.rules?.rule;
  let rules;
  if (!rulesData) return [];
  if (!Array.isArray(rulesData)) {
    rulesData = new Array(rulesData);
  }
  rules = rulesData.map((ruleData: any) => {
    const rule: Rule = {
      id: ruleData["@_id"],
      title: ruleData["@_name"],
      description: ruleData["description"],
      unit: unit["@_name"],
      detachmentRule: false,
    };
    return rule;
  });
  return rules;
}

function getPsyker(psychic: any, psyPowers: Array<PsychicPower>) {
  if (psychic.length === 0) return undefined;
  const psychicData = psychic[0].characteristics.characteristic;
  const psyker: Psychic = {
    name: psychic[0]["@_name"],
    cast: psychicData.find((obj: any) => obj["@_name"] === "Cast")["#text"],
    deny: psychicData.find((obj: any) => obj["@_name"] === "Deny")["#text"],
    powers: psychicData.find((obj: any) => obj["@_name"] === "Powers Known")["#text"],
    other: psychicData.find((obj: any) => obj["@_name"] === "Other")["#text"],
    psychicPowers: psyPowers,
  };
  return psyker;
}

function parsePsyker(unit: any): Array<any> {
  const modelPsyker =
    "profiles" in unit ? new Array(unit.profiles.profile).flat(Infinity).filter((profile: any) => profile["@_typeName"] === "Psyker") : [];
  const unitPsykerSelections = "selections" in unit ? new Array(unit.selections.selection).flat(Infinity) : [];
  const unitPsyker = unitPsykerSelections
    .filter((selection: any) => selection["@_type"] === "model" && "profiles" in selection)
    .flatMap((unit: any) => new Array(unit.profiles.profile).flat(Infinity).filter((profile: any) => profile["@_typeName"] === "Psyker"));
  return modelPsyker.concat(unitPsyker);
}

function parsePsychicPowers(unit: any, type: "model" | "unit" | "upgrade"): Array<any> {
  let psyPowers: Array<PsychicPower> = [];
  if (!("selections" in unit)) return psyPowers;

  const getPsyPowerFromSelection = (unit: any): Array<PsychicPower> => {
    if (!("selections" in unit)) return [];
    let modelSelections = Array.isArray(unit.selections.selection) ? unit.selections.selection : new Array(unit.selections.selection);
    modelSelections = modelSelections
      .map((selection: any) => "profiles" in selection && selection.profiles.profile)
      .flat(1)
      .filter((profile: any) => profile["@_typeName"] === "Psychic Power");

    return modelSelections.map((psyPower: any): PsychicPower => {
      const char = psyPower.characteristics.characteristic;
      return {
        name: psyPower["@_name"],
        warp: char.find((obj: any) => obj["@_name"] === "Warp Charge")["#text"],
        range: char.find((obj: any) => obj["@_name"] === "Range")["#text"],
        details: char.find((obj: any) => obj["@_name"] === "Details")["#text"],
      };
    });
  };

  if (type === "model") {
    psyPowers = getPsyPowerFromSelection(unit);
  } else if (type === "upgrade") {
    const upgradePsyFromSelection = getPsyPowerFromSelection(unit);
    const modelProfile =
      "profiles" in unit ? (Array.isArray(unit.profiles.profile) ? unit.profiles.profile : new Array(unit.profiles.profile)) : [];
    const upgradePsyFromProfile: Array<PsychicPower> = modelProfile
      .filter((profile: any) => profile["@_typeName"] === "Psychic Power")
      .map((psyPower: any): PsychicPower => {
        const char = psyPower.characteristics.characteristic;
        return {
          name: psyPower["@_name"],
          warp: char.find((obj: any) => obj["@_name"] === "Warp Charge")["#text"],
          range: char.find((obj: any) => obj["@_name"] === "Range")["#text"],
          details: char.find((obj: any) => obj["@_name"] === "Details")["#text"],
        };
      });
    psyPowers = psyPowers.concat(upgradePsyFromSelection, upgradePsyFromProfile);
  } else {
    const unitSelections = "selections" in unit ? unit.selections.selection : [];
    const unitPsyFromSelection: Array<PsychicPower> = Array.isArray(unitSelections)
      ? unitSelections.flatMap((unit: any): Array<PsychicPower> => {
          return getPsyPowerFromSelection(unit);
        })
      : getPsyPowerFromSelection(unitSelections);

    const modelProfile =
      "profiles" in unit ? (Array.isArray(unit.profiles.profile) ? unit.profiles.profile : new Array(unit.profiles.profile)) : [];
    const upgradePsyFromProfile: Array<PsychicPower> = modelProfile
      .filter((profile: any) => profile["@_typeName"] === "Psychic Power")
      .map((psyPower: any): PsychicPower => {
        const char = psyPower.characteristics.characteristic;
        return {
          name: psyPower["@_name"],
          warp: char.find((obj: any) => obj["@_name"] === "Warp Charge")["#text"],
          range: char.find((obj: any) => obj["@_name"] === "Range")["#text"],
          details: char.find((obj: any) => obj["@_name"] === "Details")["#text"],
        };
      });
    psyPowers = psyPowers.concat(unitPsyFromSelection, upgradePsyFromProfile);
  }

  return psyPowers;
}

function parseKeywords(unit: BS_Selection): Array<string> {
  const categories = unit.categories?.category;
  const keywords = Array.isArray(categories)
    ? categories.filter((category: any) => category["@_primary"] === "false").map((category: any) => category["@_name"])
    : [];
  return keywords;
} // DONE

function parseUnitCosts(unit: BS_Selection): string {
  let costs: string | number = "NaN";
  const allCosts = findAllByKey<BS_Selection, BS_Costs>(unit, "costs")
    .flatMap((cost) => cost.cost)
    .filter((cost: BS_Cost) => cost["@_name"] === CostType.PTS)
    .map((cost: BS_Cost) => cost["@_value"]);
  costs = Array.isArray(allCosts) ? allCosts.reduce((partial, value) => Number(partial) + Number(value)).toString() : allCosts;
  costs = costs.includes(".0") ? costs.replace(".0", "pts") : costs + "pts";
  return costs;
} // DONE

function findAllByKey<O, T>(obj: O, keyToFind: string): Array<T> {
  return Object.entries(obj as any).reduce(
    (acc, [key, value]): any =>
      key === keyToFind ? (acc as any).concat(value) : typeof value === "object" ? acc.concat(findAllByKey(value, keyToFind)) : acc,
    [] as Array<T>
  );
}

function normalizeToArray<T>(data: any): Array<T> {
  return new Array<T>().concat(data).filter(Boolean);
}

function countDublicateCharacteristics(data: Array<Characteristics>) {
  const result = [
    ...data
      .reduce((map, curr) => {
        if (map.has(curr.name)) {
          if (_.isEqual(map.get(curr.name).weapons, curr.weapons)) {
            const prevCount = map.get(curr.name).count;
            const newCount = Number(prevCount) + Number(curr.count);
            map.set(curr.name, { ...map.get(curr.name), count: newCount });
          } else {
            map.set(`${curr.name}::${curr.weapons}`, { ...curr });
          }
        } else {
          map.set(curr.name, { ...curr });
        }
        return map;
      }, new Map())
      .values(),
  ];
  return result;
}

function countDublicateWeapons(data: Array<Weapon>) {
  const result = [
    ...data
      .reduce((map, curr) => {
        if (map.has(curr.name)) {
          const prevModels = map.get(curr.name).models;
          const prevCount = map.get(curr.name).count;
          const newCount = Number(prevCount) + Number(curr.count);
          map.set(curr.name, { ...map.get(curr.name), count: newCount, models: prevModels.concat(curr.models) });
        } else {
          map.set(curr.name, { ...curr });
        }
        return map;
      }, new Map())
      .values(),
  ];
  return result;
}

export { getForce, checkIfValid };
