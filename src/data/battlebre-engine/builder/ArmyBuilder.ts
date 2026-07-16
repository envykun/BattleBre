/**
 * Öffentliche Builder-API. Die RN-App instanziiert diese Klasse und ruft
 * synchrone Mutations-/Abfragemethoden auf; jede Mutation liefert einen frischen
 * ValidationReport, sodass React neu rendern kann.
 */
import { IdGenerator, createCounterIdGenerator } from "../adapters/IdGenerator";
import { attrBool, attrNum, children } from "../data/xml";
import { CategoryLink, ForceEntry } from "../types/catalogue";
import { CatalogueId, ForceEntryId, ForceId, InstanceId, RosterId } from "../types/ids";
import {
  AddableItem,
  EffectiveEntry,
  EntryRef,
  expandAddable,
  rootRefsOf,
} from "../engine/EntryTree";
import { GameContext } from "../engine/GameContext";
import { recompute } from "../engine/Recompute";
import { rollUpRoster } from "../engine/CostEngine";
import {
  ForceInstance,
  RosterState,
  forceOfInstance,
} from "../engine/RosterState";
import {
  ResolvedCategory,
  SelectionInstance,
  createInstance,
  findInstance,
  removeInstance,
} from "../engine/SelectionInstance";
import {
  AddResult,
  AddableEntry,
  AddableForce,
  ForceView,
  RosterView,
  SelectionView,
  ValidationReport,
} from "./types";

export interface ArmyBuilderDeps {
  context: GameContext;
  idGen?: IdGenerator;
}

const EMPTY_REPORT: ValidationReport = { errors: [], warnings: [] };

export class ArmyBuilder {
  private readonly ctx: GameContext;
  private readonly idGen: IdGenerator;
  private roster: RosterState | undefined;

  constructor(deps: ArmyBuilderDeps) {
    this.ctx = deps.context;
    this.idGen = deps.idGen ?? createCounterIdGenerator();
  }

  // --- Roster-Lebenszyklus ---

  createRoster(opts: { name: string }): RosterId {
    const id = this.idGen.next("roster");
    this.roster = {
      id,
      name: opts.name,
      gameSystemId: this.ctx.gameSystem["@_id"],
      gameSystemName: this.ctx.gameSystem["@_name"],
      forces: [],
      costLimits: new Map(),
    };
    return id;
  }

  /** Wählbare Force-Einträge (Detachments) des GameSystems. */
  listForceEntries(): AddableForce[] {
    const forces = children<ForceEntry>(
      this.ctx.gameSystem.forceEntries,
      "forceEntry"
    );
    const out: AddableForce[] = [];
    for (const fe of forces) {
      for (const [catId, cat] of this.ctx.catalogues) {
        out.push({
          forceEntryId: fe["@_id"],
          name: fe["@_name"] ?? "",
          catalogueId: catId,
          catalogueName: cat["@_name"] ?? "",
        });
      }
    }
    return out;
  }

  addForce(forceEntryId: ForceEntryId, catalogueId: CatalogueId): ForceId {
    const roster = this.requireRoster();
    const fe = this.ctx.forceEntriesById.get(forceEntryId);
    const cat = this.ctx.catalogues.get(catalogueId);
    if (!fe || !cat) throw new Error("Unbekannte forceEntry- oder catalogue-Id.");
    const id = this.idGen.next("force");
    roster.forces.push({
      id,
      name: fe["@_name"] ?? "",
      forceEntryId,
      catalogueId,
      catalogueName: cat["@_name"] ?? "",
      rootSelections: [],
    });
    return id;
  }

  // --- Auswahl ---

  /** Was kann unter `target` (Force oder Instanz) hinzugefügt werden? */
  getAddableEntries(target: ForceId | InstanceId): AddableEntry[] {
    return this.addableItems(target).map((item) => this.toAddable(item.eff));
  }

  addSelection(target: ForceId | InstanceId, entryOrLinkId: string): AddResult {
    const roster = this.requireRoster();
    const item = this.addableItems(target).find((i) => i.eff.id === entryOrLinkId);
    if (!item) throw new Error(`Eintrag ${entryOrLinkId} unter ${target} nicht verfügbar.`);
    const eff = item.eff;

    const inst = createInstance(this.idGen.next("sel"), eff, {
      entryGroupId: item.groupId,
    });
    inst.categories = this.resolveCategories(eff);

    const parentInst = findInstance(this.allRoots(), target);
    if (parentInst) {
      inst.parent = parentInst;
      parentInst.children.push(inst);
    } else {
      const force = this.forceById(target);
      if (!force) throw new Error(`Ziel ${target} ist weder Force noch Instanz.`);
      force.rootSelections.push(inst);
    }

    const report = recompute(this.ctx, roster);
    return { instanceId: inst.instanceId, report };
  }

  removeSelection(instanceId: InstanceId): ValidationReport {
    const roster = this.requireRoster();
    for (const force of roster.forces) {
      if (removeInstance(force.rootSelections, instanceId)) {
        return recompute(this.ctx, roster);
      }
    }
    return this.validate();
  }

  setCount(instanceId: InstanceId, number: number): ValidationReport {
    const roster = this.requireRoster();
    const inst = findInstance(this.allRoots(), instanceId);
    if (!inst) throw new Error(`Instanz ${instanceId} nicht gefunden.`);
    inst.number = Math.max(0, Math.floor(number));
    return recompute(this.ctx, roster);
  }

  setCostLimit(costTypeId: string, value: number): void {
    this.requireRoster().costLimits.set(costTypeId, value);
  }

  // --- Auswertung / Ausgabe ---

  validate(): ValidationReport {
    if (!this.roster) return EMPTY_REPORT;
    return recompute(this.ctx, this.roster);
  }

  getState(): RosterView {
    const roster = this.requireRoster();
    const totals = rollUpRoster(roster);
    return {
      id: roster.id,
      name: roster.name,
      gameSystemName: roster.gameSystemName,
      costTotals: Array.from(totals.entries()).map(([typeId, value]) => ({
        typeId,
        name: this.ctx.costTypeName(typeId),
        value,
        limit: roster.costLimits.get(typeId),
      })),
      forces: roster.forces.map((f) => this.forceView(f)),
    };
  }

  /** Interner Zugriff für die Serialisierungs-Schicht. */
  getRosterState(): RosterState {
    return this.requireRoster();
  }

  getContext(): GameContext {
    return this.ctx;
  }

  // --- Helfer ---

  private forceView(f: ForceInstance): ForceView {
    return {
      id: f.id,
      name: f.name,
      catalogueName: f.catalogueName,
      selections: f.rootSelections.map((s) => this.selectionView(s)),
    };
  }

  private selectionView(s: SelectionInstance): SelectionView {
    return {
      instanceId: s.instanceId,
      name: s.name,
      type: s.type,
      number: s.number,
      categories: s.categories.map((c) => c.name),
      costs: Array.from(s.costs.entries()).map(([typeId, value]) => ({
        typeId,
        name: this.ctx.costTypeName(typeId),
        value,
      })),
      children: s.children.map((c) => this.selectionView(c)),
    };
  }

  private addableItems(target: ForceId | InstanceId): AddableItem[] {
    return expandAddable(this.ctx, this.addableRefs(target));
  }

  private toAddable(eff: EffectiveEntry): AddableEntry {
    return {
      id: eff.id,
      name: eff.name,
      type: eff.type,
      isGroup: eff.kind === "group",
      hidden: eff.hidden,
      costs: eff.costs.map((c) => {
        const typeId = c["@_typeId"] ?? "";
        return {
          typeId,
          name: this.ctx.costTypeName(typeId),
          value: attrNum(c["@_value"]),
        };
      }),
    };
  }

  private resolveCategories(eff: EffectiveEntry): ResolvedCategory[] {
    return eff.categoryLinks.map((link: CategoryLink) => {
      const targetId = link["@_targetId"] ?? "";
      const cat = this.ctx.resolveCategory(targetId);
      return {
        id: targetId,
        name: cat?.["@_name"] ?? link["@_name"] ?? targetId,
        primary: attrBool(link["@_primary"]),
      };
    });
  }

  /** Sammelt die verfügbaren (unaufgelösten) Referenzen unter einem Ziel. */
  private addableRefs(target: ForceId | InstanceId): EntryRef[] {
    const parentInst = findInstance(this.allRoots(), target);
    if (parentInst) return parentInst.blueprint.childRefs;

    const force = this.forceById(target);
    if (!force) return [];
    const cat = this.ctx.catalogues.get(force.catalogueId);
    if (!cat) return [];
    return rootRefsOf(cat);
  }

  private allRoots(): SelectionInstance[] {
    if (!this.roster) return [];
    return this.roster.forces.flatMap((f) => f.rootSelections);
  }

  private forceById(id: string): ForceInstance | undefined {
    return this.roster?.forces.find((f) => f.id === id);
  }

  private requireRoster(): RosterState {
    if (!this.roster) throw new Error("Kein aktives Roster – erst createRoster() aufrufen.");
    return this.roster;
  }
}

/** Ungenutzt in Signatur, aber praktisch: findet die Force einer Instanz. */
export { forceOfInstance };
