import { describe, expect, test } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";
import { BattleBreBuilderEngine } from "../index";
import {
  serializeRosterToXml,
  rosterToRawObject,
} from "../../models/roster";
import { parseRoster } from "../../parser/warhammer/dataExtractor10e";

const gst = fs.readFileSync(path.join(__dirname, "fixtures", "mini.gst"), "utf8");
const cat = fs.readFileSync(path.join(__dirname, "fixtures", "mini.cat"), "utf8");

/** Baut ein kleines Roster wie im builder-Test und liefert die Engine. */
function buildRoster() {
  const engine = BattleBreBuilderEngine.fromXml(gst, [cat]);
  engine.createRoster({ name: "Serialize Test" });
  engine.setCostLimit("pts", 500);
  const force = engine.listForceEntries()[0];
  const forceId = engine.addForce(force.forceEntryId, force.catalogueId);
  const addable = engine.getAddableEntries(forceId);

  const cap = engine.addSelection(forceId, addable.find((a) => a.name === "Captain")!.id);
  const relicId = engine
    .getAddableEntries(cap.instanceId)
    .find((w) => w.name === "Relic Blade")!.id;
  engine.addSelection(cap.instanceId, relicId);

  const tac = engine.addSelection(forceId, addable.find((a) => a.name === "Tactical Squad")!.id);
  const marineId = engine
    .getAddableEntries(tac.instanceId)
    .find((m) => m.name === "Space Marine")!.id;
  for (let i = 0; i < 5; i++) engine.addSelection(tac.instanceId, marineId);

  return engine;
}

describe("Roster-Serialisierung (Roster → XML)", () => {
  test("rosterToRawObject setzt Kern-Attribute", () => {
    const roster = buildRoster().toRoster();
    const raw = rosterToRawObject(roster).roster;
    expect(raw["@_name"]).toBe("Serialize Test");
    expect(raw.forces?.force).toBeTruthy();
  });

  test("serialisiertes XML ist wohlgeformt und enthält roster-Wurzel", () => {
    const xml = serializeRosterToXml(buildRoster().toRoster());
    expect(xml.startsWith("<?xml")).toBe(true);
    expect(xml).toContain("<roster");
    expect(xml).toContain("Tactical Squad");
    expect(xml).toContain("Relic Blade");
  });

  test("Roundtrip: bauen → serialisieren → parsen ergibt gleiche Totals/Struktur", async () => {
    const built = buildRoster().toRoster();
    const xml = serializeRosterToXml(built);
    const reloaded = await parseRoster(xml, { isZip: false });

    // Gleiche Gesamtkosten (180 pts wie im builder-Test).
    expect(reloaded.name).toBe(built.name);
    const builtPts = built.costs.find((c) => c.typeId === "pts")!.value;
    const reloadedPts = reloaded.costs.find((c) => c.typeId === "pts")!.value;
    expect(reloadedPts).toBe(builtPts);
    expect(reloadedPts).toBe(180);

    // Gleiche Force-/Selection-Struktur.
    expect(reloaded.forces).toHaveLength(built.forces.length);
    const force = reloaded.forces[0];
    const captain = force.selections.find((s) => s.name === "Captain")!;
    expect(captain).toBeTruthy();
    expect(captain.costs.find((c) => c.typeId === "pts")!.value).toBe(80);
    expect(captain.selections.some((s) => s.name === "Relic Blade")).toBe(true);

    const squad = force.selections.find((s) => s.name === "Tactical Squad")!;
    expect(squad.selections).toHaveLength(5);
  });
});
