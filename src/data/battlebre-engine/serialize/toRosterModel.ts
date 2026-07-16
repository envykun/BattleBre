/**
 * Serialisiert den internen RosterState der Engine in das App-Rendermodell
 * `src/data/models/roster` (`Roster`-Klasseninstanz). Damit kann eine im Builder
 * erstellte Liste ohne Anpassung über den RosterContext/die vorhandenen Hooks
 * angezeigt werden – dieselbe Klasse, die `parseRoster` aus einer .ros liefert.
 */
import {
  Roster,
  RosterCategory,
  RosterCharacteristic,
  RosterCost,
  RosterCostLimit,
  RosterForce,
  RosterProfile,
  RosterSelection,
} from "../../models/roster";
import { Characteristic, Profile } from "../types/catalogue";
import { children } from "../data/xml";
import { GameContext } from "../engine/GameContext";
import { rollUpRoster } from "../engine/CostEngine";
import { ForceInstance, RosterState } from "../engine/RosterState";
import { SelectionInstance } from "../engine/SelectionInstance";

export function toRosterModel(ctx: GameContext, roster: RosterState): Roster {
  const totals = rollUpRoster(roster);

  return new Roster({
    id: roster.id,
    name: roster.name,
    gameSystemId: roster.gameSystemId,
    gameSystemName: roster.gameSystemName,
    costs: Array.from(totals.entries()).map(
      ([typeId, value]) =>
        new RosterCost({ name: ctx.costTypeName(typeId), typeId, value })
    ),
    costLimits: Array.from(roster.costLimits.entries()).map(
      ([typeId, value]) =>
        new RosterCostLimit({ name: ctx.costTypeName(typeId), typeId, value })
    ),
    forces: roster.forces.map((f) => toForce(ctx, f)),
  });
}

function toForce(ctx: GameContext, force: ForceInstance): RosterForce {
  return new RosterForce({
    id: force.id,
    name: force.name,
    entryId: force.forceEntryId,
    catalogueId: force.catalogueId,
    catalogueName: force.catalogueName,
    selections: force.rootSelections.map((s) => toSelection(ctx, s)),
  });
}

function toSelection(ctx: GameContext, inst: SelectionInstance): RosterSelection {
  return new RosterSelection({
    id: inst.instanceId,
    name: inst.name,
    entryId: inst.targetId,
    entryGroupId: inst.entryGroupId,
    number: inst.number,
    numberText: String(inst.number),
    type: inst.type,
    categories: inst.categories.map(
      (c) =>
        new RosterCategory({ id: c.id, name: c.name, isPrimary: c.primary })
    ),
    profiles: inst.profiles.map((p) => toProfile(p)),
    costs: Array.from(inst.costs.entries()).map(
      ([typeId, value]) =>
        new RosterCost({ name: ctx.costTypeName(typeId), typeId, value })
    ),
    selections: inst.children.map((c) => toSelection(ctx, c)),
  });
}

function toProfile(profile: Profile): RosterProfile {
  return new RosterProfile({
    id: profile["@_id"],
    name: profile["@_name"],
    typeId: profile["@_typeId"],
    typeName: profile["@_typeName"],
    characteristics: children<Characteristic>(
      profile.characteristics,
      "characteristic"
    ).map(
      (c) =>
        new RosterCharacteristic({
          name: c["@_name"],
          typeId: c["@_typeId"],
          value: c["#text"],
        })
    ),
  });
}
