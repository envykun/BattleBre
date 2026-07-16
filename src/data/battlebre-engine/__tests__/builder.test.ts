import { describe, expect, test } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";
import { BattleBreEngine } from "../index";

const gst = fs.readFileSync(path.join(__dirname, "fixtures", "mini.gst"), "utf8");
const cat = fs.readFileSync(path.join(__dirname, "fixtures", "mini.cat"), "utf8");

function build() {
  const engine = BattleBreEngine.fromXml(gst, [cat]);
  engine.createRoster({ name: "Test Army" });
  engine.setCostLimit("pts", 500);
  const forces = engine.listForceEntries();
  const forceId = engine.addForce(forces[0].forceEntryId, forces[0].catalogueId);
  return { engine, forceId };
}

describe("BattleBreEngine – Integration mit src-Modellen", () => {
  test("Katalog laden und Force-Einträge auflisten", () => {
    const { engine, forceId } = build();
    expect(forceId).toBeTruthy();
    const addable = engine.getAddableEntries(forceId).map((a) => a.name).sort();
    expect(addable).toEqual(["Captain", "Tactical Squad"]);
  });

  test("Gruppen-Constraints: Captain braucht genau 1 Nahkampfwaffe", () => {
    const { engine, forceId } = build();
    const capEntry = engine
      .getAddableEntries(forceId)
      .find((a) => a.name === "Captain")!;
    const cap = engine.addSelection(forceId, capEntry.id);

    expect(cap.report.errors.some((e) => e.message.includes("Melee Weapon"))).toBe(true);

    const weapons = engine.getAddableEntries(cap.instanceId);
    expect(weapons.map((w) => w.name).sort()).toEqual(["Power Sword", "Relic Blade"]);

    const relic = weapons.find((w) => w.name === "Relic Blade")!;
    const afterWeapon = engine.addSelection(cap.instanceId, relic.id);
    expect(
      afterWeapon.report.errors.some((e) => e.message.includes("Melee Weapon"))
    ).toBe(false);

    const second = engine.addSelection(
      cap.instanceId,
      weapons.find((w) => w.name === "Power Sword")!.id
    );
    expect(second.report.errors.some((e) => e.message.includes("Melee Weapon"))).toBe(true);
  });

  test("Gruppen-Constraints: Tactical Squad braucht 5–10 Modelle", () => {
    const { engine, forceId } = build();
    const tacEntry = engine
      .getAddableEntries(forceId)
      .find((a) => a.name === "Tactical Squad")!;
    const tac = engine.addSelection(forceId, tacEntry.id);
    expect(tac.report.errors.some((e) => e.message.includes("Marines"))).toBe(true);

    const marineId = engine
      .getAddableEntries(tac.instanceId)
      .find((m) => m.name === "Space Marine")!.id;

    let last = tac.report;
    for (let i = 0; i < 5; i++) {
      last = engine.addSelection(tac.instanceId, marineId).report;
    }
    expect(last.errors.some((e) => e.message.includes("Marines"))).toBe(false);
  });

  test("Kosten-Aufrollung und Kostenlimit", () => {
    const { engine, forceId } = build();
    const addable = engine.getAddableEntries(forceId);

    const cap = engine.addSelection(forceId, addable.find((a) => a.name === "Captain")!.id);
    const capWeapons = engine.getAddableEntries(cap.instanceId);
    engine.addSelection(cap.instanceId, capWeapons.find((w) => w.name === "Relic Blade")!.id);

    const tac = engine.addSelection(forceId, addable.find((a) => a.name === "Tactical Squad")!.id);
    const marineId = engine.getAddableEntries(tac.instanceId).find((m) => m.name === "Space Marine")!.id;
    for (let i = 0; i < 5; i++) engine.addSelection(tac.instanceId, marineId);

    // 80 (Captain) + 10 (Relic Blade) + 5*18 (Marines) = 180
    const state = engine.getState();
    expect(state.costTotals.find((c) => c.typeId === "pts")!.value).toBe(180);

    engine.setCostLimit("pts", 100);
    expect(engine.validate().errors.some((e) => e.message.includes("Kostenlimit"))).toBe(true);
  });

  test("Export in das src Roster-Modell", () => {
    const { engine, forceId } = build();
    const addable = engine.getAddableEntries(forceId);

    const cap = engine.addSelection(forceId, addable.find((a) => a.name === "Captain")!.id);
    const relicId = engine.getAddableEntries(cap.instanceId).find((w) => w.name === "Relic Blade")!.id;
    engine.addSelection(cap.instanceId, relicId);

    const tac = engine.addSelection(forceId, addable.find((a) => a.name === "Tactical Squad")!.id);
    const marineId = engine.getAddableEntries(tac.instanceId).find((m) => m.name === "Space Marine")!.id;
    for (let i = 0; i < 5; i++) engine.addSelection(tac.instanceId, marineId);

    const roster = engine.toRoster();

    // Roster-Gesamtkosten
    expect(roster.costs.find((c) => c.typeId === "pts")!.value).toBe(180);
    expect(roster.forces).toHaveLength(1);

    const force = roster.forces[0];
    const captain = force.selections.find((s) => s.name === "Captain")!;
    // Kosten sind pro Selection (Captain selbst = 80, Relic als Kind = 10)
    expect(captain.costs.find((c) => c.typeId === "pts")!.value).toBe(80);
    expect(captain.categories.some((c) => c.name === "HQ" && c.isPrimary)).toBe(true);
    expect(captain.profiles.some((p) => p.typeName === "Unit")).toBe(true);
    const relic = captain.selections.find((s) => s.name === "Relic Blade")!;
    expect(relic.costs.find((c) => c.typeId === "pts")!.value).toBe(10);
    expect(relic.profiles.some((p) => p.typeName === "Weapon")).toBe(true);

    const squad = force.selections.find((s) => s.name === "Tactical Squad")!;
    expect(squad.categories.some((c) => c.name === "Troops" && c.isPrimary)).toBe(true);
    expect(squad.selections).toHaveLength(5);
  });
});
