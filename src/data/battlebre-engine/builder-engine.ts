/**
 * BattleBreBuilderEngine – die öffentliche Fassade des List-Builder-Service.
 *
 * Bündelt Laden (GameSystem + Kataloge), den Bau-Workflow (Forces/Auswahlen
 * hinzufügen/entfernen), Validierung und den Export in das App-Rendermodell
 * `src/data/models/roster` (`Roster`).
 */
import { IdGenerator } from "./adapters/IdGenerator";
import { ArmyBuilder } from "./builder/ArmyBuilder";
import {
  AddResult,
  AddableEntry,
  AddableForce,
  RosterView,
  ValidationReport,
} from "./builder/types";
import { parseDataObject } from "./data/xml";
import { GameContext } from "./engine/GameContext";
import { RawCatalogue, RawGameSystem } from "./types/catalogue";
import { ForceId, InstanceId } from "./types/ids";
import { toRosterModel } from "./serialize/toRosterModel";
import type { Roster } from "../models/roster";

export interface BattleBreBuilderEngineOptions {
  idGen?: IdGenerator;
}

export class BattleBreBuilderEngine {
  private readonly ctx: GameContext;
  private readonly builder: ArmyBuilder;

  constructor(context: GameContext, options: BattleBreBuilderEngineOptions = {}) {
    this.ctx = context;
    this.builder = new ArmyBuilder({ context, idGen: options.idGen });
  }

  /** Baut die Engine aus rohem GameSystem-(.gst) und Katalog-(.cat) XML. */
  static fromXml(
    gameSystemXml: string,
    catalogueXmls: string[],
    options: BattleBreBuilderEngineOptions = {}
  ): BattleBreBuilderEngine {
    const gs = parseDataObject(gameSystemXml);
    if (gs.kind !== "gameSystem") {
      throw new Error("Erstes Argument muss ein GameSystem (.gst) sein.");
    }
    const cats: RawCatalogue[] = catalogueXmls.map((xml) => {
      const parsed = parseDataObject(xml);
      if (parsed.kind !== "catalogue") {
        throw new Error("Katalog-Argument muss ein Catalogue (.cat) sein.");
      }
      return parsed.data as RawCatalogue;
    });
    const context = new GameContext(gs.data as RawGameSystem, cats);
    return new BattleBreBuilderEngine(context, options);
  }

  // --- Bau-Workflow (delegiert an ArmyBuilder) ---

  createRoster(opts: { name: string }): string {
    return this.builder.createRoster(opts);
  }

  listForceEntries(): AddableForce[] {
    return this.builder.listForceEntries();
  }

  addForce(forceEntryId: string, catalogueId: string): ForceId {
    return this.builder.addForce(forceEntryId, catalogueId);
  }

  getAddableEntries(target: ForceId | InstanceId): AddableEntry[] {
    return this.builder.getAddableEntries(target);
  }

  addSelection(target: ForceId | InstanceId, entryOrLinkId: string): AddResult {
    return this.builder.addSelection(target, entryOrLinkId);
  }

  removeSelection(instanceId: InstanceId): ValidationReport {
    return this.builder.removeSelection(instanceId);
  }

  setCount(instanceId: InstanceId, number: number): ValidationReport {
    return this.builder.setCount(instanceId, number);
  }

  setCostLimit(costTypeId: string, value: number): void {
    this.builder.setCostLimit(costTypeId, value);
  }

  validate(): ValidationReport {
    return this.builder.validate();
  }

  getState(): RosterView {
    return this.builder.getState();
  }

  /** Export in das App-Rendermodell (dieselbe Klasse wie `parseRoster`). */
  toRoster(): Roster {
    return toRosterModel(this.ctx, this.builder.getRosterState());
  }

  /** Zugriff auf den geladenen Kontext (fortgeschrittene Nutzung). */
  getContext(): GameContext {
    return this.ctx;
  }
}
