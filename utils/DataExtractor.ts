import { X2jOptions, XMLParser } from "fast-xml-parser";
import JSZip from "jszip";
import { DataExtractorType } from "../hooks/DataContext";
import { Ability, Characteristics, DetachmentRule, Psychic, PsychicPower, RosterCosts, Rule, Unit, Weapon } from "./DataTypes";

async function checkIfValid(data: string): Promise<boolean> {
  const xml2JSON = parseXML(data);

  return new Promise((resolve) => {
    if (Object.keys(xml2JSON).length === 0 && xml2JSON.constructor === Object) {
      console.log("THIS IS THE DATA", xml2JSON);
      throw new Error("Parsing file not possible.");
    }
    resolve(true);
  });
}

const unzip = async (file: string): Promise<string> => {
  if (file.charAt(0) !== "P") {
    return file;
  } else {
    const jszip = new JSZip();
    const zip = await jszip.loadAsync(file);
    return zip.file(/[^/]+\.ros/)[0].async("string"); // Get roster files that are in the root
  }
};

function getForce(data: string, isZip: boolean): DataExtractorType {
  const xml2JSON = parseXML(data);
  const detachments = getDetachments(xml2JSON);

  const forceRules: Array<Rule> = getForceRules(detachments);
  const unitData: Array<Unit> = getSelections(detachments);
  const rosterCost: RosterCosts = parseRosterCosts(xml2JSON);

  // unzip(data)
  //   .then((xml) => parseXML(xml))
  //   .catch((err) => console.log(err));

  //   return forceArray;
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

function getDetachments(data: any) {
  return data.roster.forces.force;
}

function getForceRules(detachment: any): Array<Rule> {
  let rules;
  if (Array.isArray(detachment)) {
    const filteredDetachment = detachment.filter((detach: any) => "rules" in detach);
    rules = [...new Map(filteredDetachment.map((detach: any) => [detach.rules.rule["@_id"], detach.rules.rule])).values()];
  } else {
    if (!("rules" in detachment)) return [];
    rules = Array.isArray(detachment.rules.rule) ? detachment.rules.rule : new Array(detachment.rules.rule);
  }
  rules = rules.map((ruleData: any) => {
    const rule: Rule = { id: ruleData["@_id"], title: ruleData["@_name"], description: ruleData["description"], detachmentRule: false };
    return rule;
  });
  return rules;
}

function getForceSelections(force: any): any {
  const forceSelection = findAllByKey(force, "selection")
    .filter((selection: any) =>
      selection["@_type"] === "upgrade" && "categories" in selection && Array.isArray(selection.categories.category)
        ? selection.categories.category.some((category: any) => category["@_name"] === "Configuration")
        : selection.categories.category["@_name"] === "Configuration"
    )
    .flatMap((selection: any) => findAllByKey(selection, "selection").filter((select: any) => "profiles" in select))
    .map((a: any) => {
      const profile = a.profiles.profile;
      const description = profile.characteristics.characteristic["#text"];
      const ability: Rule = {
        id: profile["@_id"],
        description: description,
        title: profile["@_name"],
        detachmentRule: true,
      };
      const rule: DetachmentRule = { title: a["@_name"], abilities: ability };
      return rule;
    });
  return forceSelection;
}

function getSelections(forces: any): Array<Unit> {
  let selections;
  let allUnits: string | any[] = [];
  if (Array.isArray(forces)) {
    const allUnitsArray = forces.map((force, index) => {
      const detachmentRules: Array<DetachmentRule> = getForceSelections(force);
      selections = force.selections.selection;
      if (detachmentRules.length > 0) {
        return parseUnits(selections, `${index + 1}. ${force["@_name"]}: ${detachmentRules[0].title}`, detachmentRules[0].abilities);
      } else {
        return parseUnits(selections, `${index + 1}. ${force["@_name"]}`);
      }
    });
    allUnits = allUnits.concat.apply(allUnits, allUnitsArray);
  } else {
    const detachmentRules: Array<DetachmentRule> = getForceSelections(forces);
    selections = forces.selections.selection;
    if (detachmentRules.length > 0) {
      allUnits = parseUnits(selections, forces["@_name"], detachmentRules[0].abilities);
    } else {
      allUnits = parseUnits(selections, forces["@_name"]);
    }
  }
  return allUnits;
}

function getUnitType(unit: any): string {
  const categories = unit.categories.category;
  const primary = Array.isArray(categories) ? categories.find((category: any) => category["@_primary"] === "true") : categories;
  let unitType: string = "NaN";
  if (primary) {
    unitType = primary["@_name"];
  }
  return unitType;
}

function parseUnits(force: any, detachmentName: any, detachmentRules?: any): Array<Unit> {
  const typeModelData: Array<unknown> = force.filter((selection: any) => selection["@_type"] === "model");
  const typeUnitData: Array<unknown> = force.filter((selection: any) => selection["@_type"] === "unit");
  const typeUpgradeData: Array<unknown> = force.filter((selection: any) => selection["@_type"] === "upgrade" && "profiles" in selection);

  const allModels: Array<Unit> = typeModelData.map((model: any) => createUnitFromData(model, detachmentName, "model", detachmentRules));
  const allUnits: Array<Unit> = typeUnitData.map((unit: any) => createUnitFromData(unit, detachmentName, "unit", detachmentRules));
  const allUpgradeUnits: Array<Unit> = typeUpgradeData.map((unit: any) =>
    createUnitFromData(unit, detachmentName, "upgrade", detachmentRules)
  );

  const allUnitsData: Array<Unit> = allModels.concat(allUnits, allUpgradeUnits);
  return allUnitsData;
}

function createUnitFromData(model: any, detachmentName: string, type: "model" | "unit" | "upgrade", detachmentRules: any): Unit {
  const unitPsyker = parsePsyker(model);
  const unitPsychicPowers = parsePsychicPowers(model, type);

  const unit: Unit = {
    id: Math.random() + "::" + model["@_name"],
    name: model["@_name"],
    type: getUnitType(model),
    keywords: parseKeywords(model),
    detachment: detachmentName,
    characteristics: createCharacteristic(model, type),
    weapons: parseWeapons(model),
    abilities: parseAbilities(model),
    psychic: getPsyker(unitPsyker, unitPsychicPowers),
    rules: detachmentRules ? parseUnitRules(model).concat(detachmentRules) : parseUnitRules(model),
    costs: parseUnitCosts(model),
  };
  return unit;
}

function createCharacteristic(model: any, type: "model" | "unit" | "upgrade"): Array<Characteristics> {
  const characteristicFromModel = (unit: any) => {
    const unitProfiles = unit.profiles.profile;
    const unitProfile = Array.isArray(unitProfiles)
      ? unitProfiles.filter((profile: any) => profile["@_typeName"] === "Unit")
      : new Array(unitProfiles).filter((profile: any) => profile["@_typeName"] === "Unit");
    const unitCharacteristics = unitProfile.map((profile: any) => {
      const char = profile.characteristics.characteristic;
      return {
        name: profile["@_name"],
        m: char.find((obj: any) => {
          return obj["@_name"] === "M";
        })["#text"],
        ws: char.find((obj: any) => {
          return obj["@_name"] === "WS";
        })["#text"],
        bs: char.find((obj: any) => {
          return obj["@_name"] === "BS";
        })["#text"],
        s: char.find((obj: any) => {
          return obj["@_name"] === "S";
        })["#text"],
        t: char.find((obj: any) => {
          return obj["@_name"] === "T";
        })["#text"],
        w: char.find((obj: any) => {
          return obj["@_name"] === "W";
        })["#text"],
        a: char.find((obj: any) => {
          return obj["@_name"] === "A";
        })["#text"],
        ld: char.find((obj: any) => {
          return obj["@_name"] === "Ld";
        })["#text"],
        sv: char.find((obj: any) => {
          return obj["@_name"] === "Save";
        })["#text"],
      };
    });
    return unitCharacteristics;
  };

  let characteristics: Array<Characteristics> = [];

  if (type === "model") {
    characteristics = characteristicFromModel(model);
  } else if (type === "unit" || type === "upgrade") {
    const unitProfile: Array<Characteristics> =
      "profiles" in model &&
      (Array.isArray(model.profiles.profile)
        ? model.profiles.profile.some((e: any) => e["@_typeName"] === "Unit")
        : model.profiles.profile["@_typeName"] === "Unit")
        ? characteristicFromModel(model)
        : [];
    const subUnits =
      "selections" in model
        ? Array.isArray(model.selections.selection)
          ? model.selections.selection
          : new Array(model.selections.selection)
        : [];
    const subUnit: Array<any> = subUnits.filter(
      (selection: any) => "profiles" in selection && (selection["@_type"] === "model" || selection["@_type"] === "upgrade")
    );
    const subUnitProfile: Array<Characteristics> = subUnit
      .map((unit: any) => {
        return characteristicFromModel(unit);
      })
      .flat(1);
    characteristics = [...new Map(unitProfile.concat(subUnitProfile).map((unit: any) => [unit.name, unit])).values()];
  }
  return characteristics;
}

function parseUpgrades(unit: any): Array<any> {
  let allUpgrades: Array<unknown> = [];
  const unitUpgrades = new Array(unit.selections.selection).flat(Infinity).filter((upgrade: any) => upgrade["@_type"] === "upgrade");
  const deeperUnitUpgrades = new Array(unit.selections.selection)
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

function parseAbilities(unit: any): Array<Ability> {
  let allAbilities: Array<Ability> = [];
  const unitProfile = "profiles" in unit ? new Array(unit.profiles.profile).flat(Infinity) : [];
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

function parseWeapons(unit: any): Array<Weapon> {
  let allWeapons: Array<Weapon> = [];
  const weaponUpgrades = parseUpgrades(unit)
    .filter((upgrade: any) => "profiles" in upgrade)
    .filter((upgrade: any) =>
      Array.isArray(upgrade.profiles.profile)
        ? upgrade.profiles.profile.filter((upgrade: any) => upgrade["@_typeName"] === "Weapon")
        : upgrade.profiles.profile["@_typeName"] === "Weapon"
    );

  const weaponUpgradesInUpgrades = parseUpgrades(unit)
    .filter((upgrade: any) => "selections" in upgrade)
    .map((selection: any) => selection.selections.selection)
    .filter((upgrade: any) => "profiles" in upgrade)
    .filter((upgrade: any) =>
      Array.isArray(upgrade.profiles.profile)
        ? upgrade.profiles.profile.filter((upgrade: any) => upgrade["@_typeName"] === "Weapon")
        : upgrade.profiles.profile["@_typeName"] === "Weapon"
    );

  const weapons: Array<Weapon> = weaponUpgrades.concat(weaponUpgradesInUpgrades).flatMap((weaponData: any) => {
    const weaponProfile = weaponData.profiles.profile;
    if (Array.isArray(weaponProfile)) {
      const profileArray: Array<Weapon> = weaponProfile
        .filter((upgrade: any) => upgrade["@_typeName"] === "Weapon")
        .map((profile: any) => {
          const weaponCharacteristic = profile.characteristics.characteristic;
          const weapon: Weapon = {
            name: profile["@_name"],
            range: weaponCharacteristic.find((item: any) => item["@_name"] === "Range")["#text"],
            type: weaponCharacteristic.find((item: any) => item["@_name"] === "Type")["#text"],
            s: weaponCharacteristic.find((item: any) => item["@_name"] === "S")["#text"],
            ap: weaponCharacteristic.find((item: any) => item["@_name"] === "AP")["#text"],
            d: weaponCharacteristic.find((item: any) => item["@_name"] === "D")["#text"],
            ability: weaponCharacteristic.find((item: any) => item["@_name"] === "Abilities")["#text"],
            count: weaponData["@_number"],
          };
          return weapon;
        });
      return profileArray;
    } else {
      const weaponCharacteristic = weaponProfile.characteristics.characteristic;
      const weapon: Weapon = {
        name: weaponProfile["@_name"],
        range: weaponCharacteristic.find((item: any) => item["@_name"] === "Range")["#text"],
        type: weaponCharacteristic.find((item: any) => item["@_name"] === "Type")["#text"],
        s: weaponCharacteristic.find((item: any) => item["@_name"] === "S")["#text"],
        ap: weaponCharacteristic.find((item: any) => item["@_name"] === "AP")["#text"],
        d: weaponCharacteristic.find((item: any) => item["@_name"] === "D")["#text"],
        ability: weaponCharacteristic.find((item: any) => item["@_name"] === "Abilities")["#text"],
        count: weaponData["@_number"],
      };
      return weapon;
    }
  });

  allWeapons = [...new Map(weapons.map((unit: any) => [unit.name, unit])).values()].sort((a, b) => a.name.localeCompare(b.name));
  return allWeapons;
}

function parseUnitRules(unit: any): Array<Rule> {
  let rulesData: any = "rules" in unit && unit.rules.rule;
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

function parseKeywords(unit: any): Array<string> {
  const categories = unit.categories.category;
  const keywords = Array.isArray(categories)
    ? categories.filter((category: any) => category["@_primary"] === "false").map((category: any) => category["@_name"])
    : [];
  return keywords;
}

function parseRosterCosts(data: any): RosterCosts {
  const rosterData = data.roster.costs.cost;
  const forces = getDetachments(data);
  const factionName = Array.isArray(forces) ? forces[0]["@_catalogueName"] : forces["@_catalogueName"];
  const hasCabal = rosterData.find((r: any) => r["@_name"] === "Cabal Points")
    ? rosterData.find((r: any) => r["@_name"] === "Cabal Points")["@_value"]
    : undefined;
  return {
    faction: factionName,
    points: rosterData.find((r: any) => r["@_name"] === "pts")["@_value"],
    cp: rosterData.find((r: any) => r["@_name"] === "CP")["@_value"],
    cabal: hasCabal,
  };
}

function parseUnitCosts(unit: any): string {
  let costs: string = "NaN";
  const allCosts = findAllByKey(unit, "costs")
    .flatMap((cost: any) => cost.cost)
    .filter((cost: any) => cost["@_typeId"] === "points")
    .map((cost: any) => cost["@_value"]);
  costs = Array.isArray(allCosts) ? allCosts.reduce((partial, value) => Number(partial) + Number(value)).toString() : allCosts;
  costs = costs.includes(".0") ? costs.replace(".0", "pts") : costs + "pts";
  return costs;
}

function findAllByKey(obj: any, keyToFind: any): any {
  return Object.entries(obj).reduce(
    (acc, [key, value]): any =>
      key === keyToFind ? acc.concat(value) : typeof value === "object" ? acc.concat(findAllByKey(value, keyToFind)) : acc,
    [] as any
  );
}

export { getForce, checkIfValid };
