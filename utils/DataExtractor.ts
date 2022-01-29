import { validationOptions, X2jOptions, XMLParser } from "fast-xml-parser";
import { Ability, Characteristics, Psychic, PsychicPower, RosterCosts, Rule, Unit, Weapon } from "./DataTypes";

function getForce(data: string): any {
  const xml2JSON = parseXML(data);

  const detachments = getDetachments(xml2JSON);
  const forceRules = getForceRules(detachments);
  const unitData = getSelections(detachments);
  const rosterCost = parseRosterCosts(xml2JSON);

  // unzip(data)
  //   .then((xml) => parseXML(xml))
  //   .catch((err) => console.log(err));

  //   return forceArray;
  return { unitData, rosterCost, forceRules };
}

const options: Partial<X2jOptions> = {
  attributeNamePrefix: "@_",
  ignoreAttributes: false,
};

function parseXML(xmldata: string) {
  let parser = new XMLParser(options);
  let doc = parser.parse(xmldata);

  if (doc) {
    return doc;
    let rosterName = doc.roster["@_name"];
    let rosterPL = doc.roster.costs.cost[0]["@_value"];
    let rosterCP = doc.roster.costs.cost[1]["@_value"];
    let rosterPTS = doc.roster.costs.cost[2]["@_value"];

    let detachments: Array<Object> = doc.roster.forces.force;
    console.log(detachments.length);
  }
}

function getDetachments(data: any) {
  return data.roster.forces.force;
}

function getForceRules(detachment: any) {
  let rules;
  if (Array.isArray(detachment)) {
    rules = [...new Map(detachment.map((detach: any) => [detach.rules.rule["@_id"], detach.rules.rule])).values()];
  } else {
    if (!("rules" in detachment)) return;
    rules = Array.isArray(detachment.rules.rule) ? detachment.rules.rule : new Array(detachment.rules.rule);
  }
  rules = rules.map((ruleData: any) => {
    const rule: Rule = { id: ruleData["@_id"], title: ruleData["@_name"], description: ruleData["description"] };
    return rule;
  });
  return rules;
}

function getSelections(forces: any) {
  let selections;
  let allUnits: string | any[] = [];
  if (Array.isArray(forces)) {
    const allUnitsArray = forces.map((force, index) => {
      selections = force.selections.selection;
      return parseUnits(selections, `${index + 1}. ${force["@_name"]}`);
      // return getUnits(selections, `${index + 1}. ${force["@_name"]}`);
    });
    allUnits = allUnits.concat.apply(allUnits, allUnitsArray);
  } else {
    selections = forces.selections.selection;
    // allUnits = getUnits(selections, forces["@_name"]);
    allUnits = parseUnits(selections, forces["@_name"]);
  }
  return allUnits;
}

function getUnits(selections: any, detachmentName: any) {
  const modelOnly = selections.filter(
    (selection: any) => selection["@_type"] === "model" || (selection["@_type"] === "upgrade" && "profiles" in selection)
  );
  const units = modelOnly.map((unit: any): Unit => {
    const unitProfiles = unit.profiles.profile;
    const unitProfile = unitProfiles.filter((profile: any) => profile["@_typeName"] === "Unit");
    const unitAbilities = unitProfiles.filter((profile: any) => profile["@_typeName"] === "Abilities");
    const unitPsyker = unitProfiles.filter((profile: any) => profile["@_typeName"] === "Psyker");

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

    const allAbilities: Array<Ability> = unitAbilities.map((abilityData: any) => {
      const ability: Ability = { name: abilityData["@_name"], text: abilityData.characteristics.characteristic["#text"] };
      return ability;
    });

    // const isPsyker = unitPsyker

    const unitUpgrades = getAbilitiesFromUpgrades(unit);
    const unitPsychicPowers = getPsychicPowersFromUpgrades(unit);
    const unitWeapons = getWeapons(unit);

    return {
      id: unit["@_name"] + Math.random(),
      name: unit["@_name"],
      type: getUnitType(unit),
      keywords: [],
      detachment: detachmentName,
      characteristics: unitCharacteristics,
      weapons: unitWeapons,
      abilities: allAbilities.concat(unitUpgrades),
      psychic: getPsyker(unitPsyker, unitPsychicPowers),
    };
  });

  const subUnits = getSubUnits(selections, detachmentName);

  return units.concat(subUnits);
}

function getSubUnits(selections: any, detachmentName: any) {
  const subModels = selections.filter((selection: any) => selection["@_type"] === "unit");
  const subUnits = subModels.map((selection: any) => {
    const unitName = selection["@_name"];
    let modelTypes = selection.selections.selection
      .filter((selection: any) => selection["@_type"] === "model")
      .filter((selection: any) => "profiles" in selection);
    const unitTypes = "profiles" in selection && selection.profiles.profile["@_typeName"] === "Unit" && selection;

    if (unitTypes) {
      modelTypes = modelTypes.concat(unitTypes);
    }

    const unitCharacteristics = modelTypes.map((unit: any) => {
      let unitProfile = unit.profiles.profile;

      let char;
      if (Array.isArray(unitProfile)) {
        unitProfile = unitProfile.find((unit) => unit["@_typeName"] === "Unit");
        char = unitProfile.characteristics.characteristic;
      } else {
        char = unitProfile.characteristics.characteristic;
      }

      return {
        name: unitProfile["@_name"],
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
    // const unitUpgrades = getUpgrades(selection);
    const unitWeapons = getWeapons(selection);

    return {
      id: unitName + Math.random(),
      name: unitName,
      type: getUnitType(selection),
      keywords: [],
      detachment: detachmentName,
      characteristics: unitCharacteristics,
      weapons: unitWeapons,
      abilities: [],
    };
  });
  return subUnits;
}

function getUnitType(unit: any): string {
  const categories = unit.categories.category;
  const primary = categories.find((category: any) => category["@_primary"] === "true");
  let unitType: string = "NaN";
  if (primary) {
    unitType = primary["@_name"];
  }
  return unitType;
}

function getAbilitiesFromUpgrades(unit: any) {
  const upgradesData = unit.selections.selection;
  let upgrades: Array<Ability> = [];
  if (Array.isArray(upgradesData)) {
    const upgradesList = upgradesData.filter(
      (upgrade: any) => "profiles" in upgrade && upgrade.profiles.profile["@_typeName"] === "Abilities"
    );
    upgrades = upgradesList.map((upgrade: any): Ability => {
      const ability = upgrade.profiles.profile;
      return { name: ability["@_name"], text: ability.characteristics.characteristic["#text"] };
    });
  }
  // console.log(`----${unit["@_name"]}----`, upgradesData);
  return upgrades;
}

function getWeapons(unit: any): Array<Weapon> {
  const upgradesData = unit.selections.selection;
  let weaponsClassic: Array<Weapon> = [];
  let weaponsWeird: Array<Weapon | Array<Weapon>> = [];
  let weapons: Array<Weapon> = [];
  console.log(`--Unit--${unit["@_name"]}----`);

  if (Array.isArray(upgradesData)) {
    const weaponsDataClassic = upgradesData.filter(
      (upgrade: any) => "profiles" in upgrade && upgrade.profiles.profile["@_typeName"] === "Weapon"
    );

    const weaponsDataWeird = upgradesData.filter(
      (upgrade: any) =>
        "selections" in upgrade &&
        (Array.isArray(upgrade.selections.selection)
          ? upgrade.selections.selection.filter((select: any) => select.profiles.profile["@_typeName"] === "Weapon")
          : upgrade.selections.selection.profiles.profile["@_typeName"] === "Weapon")
    );

    weaponsClassic = weaponsDataClassic.map((weaponData: any) => {
      const characteristics = weaponData.profiles.profile.characteristics.characteristic;
      const weapon: Weapon = {
        name: weaponData["@_name"],
        range: characteristics.find((item: any) => item["@_name"] === "Range")["#text"],
        type: characteristics.find((item: any) => item["@_name"] === "Type")["#text"],
        s: characteristics.find((item: any) => item["@_name"] === "S")["#text"],
        ap: characteristics.find((item: any) => item["@_name"] === "AP")["#text"],
        d: characteristics.find((item: any) => item["@_name"] === "D")["#text"],
        ability: characteristics.find((item: any) => item["@_name"] === "Abilities")["#text"],
      };
      return weapon;
    });

    weaponsWeird = weaponsDataWeird.map((weird: any) => {
      const weaponData = weird.selections.selection;
      if (Array.isArray(weaponData)) {
        const nestedWeapon = weaponData
          .filter((weapon: any) => weapon.profiles.profile["@_typeName"] === "Weapon")
          .map((nested: any) => {
            const characteristics = nested.profiles.profile.characteristics.characteristic;
            const weapon: Weapon = {
              name: nested["@_name"],
              range: characteristics.find((item: any) => item["@_name"] === "Range")["#text"],
              type: characteristics.find((item: any) => item["@_name"] === "Type")["#text"],
              s: characteristics.find((item: any) => item["@_name"] === "S")["#text"],
              ap: characteristics.find((item: any) => item["@_name"] === "AP")["#text"],
              d: characteristics.find((item: any) => item["@_name"] === "D")["#text"],
              ability: characteristics.find((item: any) => item["@_name"] === "Abilities")["#text"],
            };
            return weapon;
          });
        return nestedWeapon;
      } else {
        const characteristics = weaponData.profiles.profile.characteristics.characteristic;
        const weapon: Weapon = {
          name: weaponData["@_name"],
          range: characteristics.find((item: any) => item["@_name"] === "Range")["#text"],
          type: characteristics.find((item: any) => item["@_name"] === "Type")["#text"],
          s: characteristics.find((item: any) => item["@_name"] === "S")["#text"],
          ap: characteristics.find((item: any) => item["@_name"] === "AP")["#text"],
          d: characteristics.find((item: any) => item["@_name"] === "D")["#text"],
          ability: characteristics.find((item: any) => item["@_name"] === "Abilities")["#text"],
        };
        return weapon;
      }
    });
  }
  weaponsWeird = weaponsWeird.flat(Infinity);

  const weaponsUnique = [...new Map(weaponsWeird.map((weapon: any) => [weapon.name, weapon])).values()];
  weapons = weaponsClassic.concat(weaponsUnique);
  return weapons;
}

function getPsychicPowersFromUpgrades(unit: any) {
  let psyPowers: Array<PsychicPower> = [];
  if (!("selections" in unit)) return psyPowers;
  const upgradesData = unit.selections.selection;
  if (Array.isArray(upgradesData)) {
    const upgradesList = upgradesData.filter(
      (upgrade: any) => "profiles" in upgrade && upgrade.profiles.profile["@_typeName"] === "Psychic Power"
    );
    psyPowers = upgradesList.map((upgrade: any): PsychicPower => {
      const power = upgrade.profiles.profile;
      const powerC = power.characteristics.characteristic;
      return {
        name: power["@_name"],
        warp: powerC.find((obj: any) => obj["@_name"] === "Warp Charge")["#text"],
        range: powerC.find((obj: any) => obj["@_name"] === "Range")["#text"],
        details: powerC.find((obj: any) => obj["@_name"] === "Details")["#text"],
      };
    });
  }
  return psyPowers;
}

// -------- NEW FUNCTIONS ------------
function parseUnits(force: any, detachmentName: any): Array<Unit> {
  const typeModelData: Array<unknown> = force.filter((selection: any) => selection["@_type"] === "model");
  const typeUnitData: Array<unknown> = force.filter((selection: any) => selection["@_type"] === "unit");
  const typeUpgradeData: Array<unknown> = force.filter((selection: any) => selection["@_type"] === "upgrade" && "profiles" in selection);

  const allModels: Array<Unit> = typeModelData.map((model: any) => createUnitFromData(model, detachmentName, "model"));
  const allUnits: Array<Unit> = typeUnitData.map((unit: any) => createUnitFromData(unit, detachmentName, "unit"));
  const allUpgradeUnits: Array<Unit> = typeUpgradeData.map((unit: any) => createUnitFromData(unit, detachmentName, "upgrade"));

  const allUnitsData: Array<Unit> = allModels.concat(allUnits, allUpgradeUnits);
  return allUnitsData;
}

function createUnitFromData(model: any, detachmentName: string, type: "model" | "unit" | "upgrade"): Unit {
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
    rules: parseUnitRules(model),
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
    const rule: Rule = { id: ruleData["@_id"], title: ruleData["@_name"], description: ruleData["description"], unit: unit["@_name"] };
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
  const keywords = categories.filter((category: any) => category["@_primary"] === "false").map((category: any) => category["@_name"]);
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

// const unzip = async (file: string): Promise<string> => {
//   if (file.charAt(0) !== "P") {
//     return file;
//   } else {
//     const jszip = new JSZip();
//     const zip = await jszip.loadAsync(file);
//     return zip.file(/[^/]+\.ros/)[0].async("string"); // Get roster files that are in the root
//   }
// };

export { getForce };
