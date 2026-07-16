/**
 * GameContext: das einmal pro geladenem System aufgebaute, unveränderliche
 * Nachschlagewerk. Enthält GameSystem + alle Kataloge und flache Id-Indizes
 * über sämtliche Knoten, damit Links (targetId) in O(1) aufgelöst werden.
 *
 * BattleScribe-Ids sind in der Praxis global eindeutige GUIDs; ein globaler
 * Index ist daher korrekt. (Die im Plan erwähnte Auflösungsreihenfolge
 * "eigenes Catalogue → Import → GameSystem" ist nur bei Id-Kollisionen relevant
 * und wird bei Bedarf in einer späteren Phase verfeinert.)
 */
import {
  CategoryEntry,
  Constraint,
  CostType,
  ForceEntry,
  Profile,
  ProfileType,
  RawCatalogue,
  RawGameSystem,
  Rule,
  SelectionEntry,
  SelectionEntryGroup,
} from "../types/catalogue";
import {
  CategoryId,
  CostTypeId,
  EntryId,
  ForceEntryId,
  ProfileTypeId,
} from "../types/ids";
import { children } from "../data/xml";

export type LinkableNode = SelectionEntry | SelectionEntryGroup;

export class GameContext {
  readonly gameSystem: RawGameSystem;
  readonly catalogues: Map<string, RawCatalogue> = new Map();

  readonly entriesById = new Map<EntryId, LinkableNode>();
  readonly profilesById = new Map<string, Profile>();
  readonly rulesById = new Map<string, Rule>();
  readonly categoryEntriesById = new Map<CategoryId, CategoryEntry>();
  readonly forceEntriesById = new Map<ForceEntryId, ForceEntry>();
  readonly costTypesById = new Map<CostTypeId, CostType>();
  readonly profileTypesById = new Map<ProfileTypeId, ProfileType>();
  readonly constraintsById = new Map<string, Constraint>();

  /** Diagnosen aus dem Aufbau (z. B. mehrfach vergebene Ids). */
  readonly diagnostics: string[] = [];

  constructor(gameSystem: RawGameSystem, catalogues: RawCatalogue[]) {
    this.gameSystem = gameSystem;
    this.indexRoot(gameSystem);
    for (const cat of catalogues) {
      this.catalogues.set(cat["@_id"], cat);
      this.indexRoot(cat);
    }
  }

  /** Root eines gst/cat indexieren. */
  private indexRoot(root: RawGameSystem | RawCatalogue): void {
    children<CostType>(root.costTypes, "costType").forEach((c) =>
      this.costTypesById.set(c["@_id"], c)
    );
    children<ProfileType>(root.profileTypes, "profileType").forEach((p) =>
      this.profileTypesById.set(p["@_id"], p)
    );
    children<CategoryEntry>(root.categoryEntries, "categoryEntry").forEach((c) => {
      this.categoryEntriesById.set(c["@_id"], c);
      this.indexConstraints(c.constraints);
    });
    children<ForceEntry>(root.forceEntries, "forceEntry").forEach((f) =>
      this.indexForceEntry(f)
    );
    children<Rule>(root.sharedRules, "rule").forEach((r) =>
      this.rulesById.set(r["@_id"], r)
    );
    children<Rule>(root.rules, "rule").forEach((r) =>
      this.rulesById.set(r["@_id"], r)
    );
    children<Profile>(root.sharedProfiles, "profile").forEach((p) =>
      this.profilesById.set(p["@_id"], p)
    );

    children<SelectionEntry>(root.sharedSelectionEntries, "selectionEntry").forEach(
      (e) => this.indexSelectionEntry(e)
    );
    children<SelectionEntryGroup>(
      root.sharedSelectionEntryGroups,
      "selectionEntryGroup"
    ).forEach((g) => this.indexSelectionEntryGroup(g));
    children<SelectionEntry>(root.selectionEntries, "selectionEntry").forEach((e) =>
      this.indexSelectionEntry(e)
    );
    children<SelectionEntryGroup>(
      root.selectionEntryGroups,
      "selectionEntryGroup"
    ).forEach((g) => this.indexSelectionEntryGroup(g));
  }

  private indexForceEntry(f: ForceEntry): void {
    if (this.forceEntriesById.has(f["@_id"])) {
      this.diagnostics.push(`Doppelte forceEntry-Id: ${f["@_id"]}`);
    }
    this.forceEntriesById.set(f["@_id"], f);
    this.indexConstraints(f.constraints);
    children<ForceEntry>(f.forceEntries, "forceEntry").forEach((nested) =>
      this.indexForceEntry(nested)
    );
  }

  private indexSelectionEntry(e: SelectionEntry): void {
    this.register(e["@_id"], e);
    this.indexConstraints(e.constraints);
    children<Profile>(e.profiles, "profile").forEach((p) =>
      this.profilesById.set(p["@_id"], p)
    );
    children<Rule>(e.rules, "rule").forEach((r) =>
      this.rulesById.set(r["@_id"], r)
    );
    children<SelectionEntry>(e.selectionEntries, "selectionEntry").forEach((c) =>
      this.indexSelectionEntry(c)
    );
    children<SelectionEntryGroup>(
      e.selectionEntryGroups,
      "selectionEntryGroup"
    ).forEach((g) => this.indexSelectionEntryGroup(g));
  }

  private indexSelectionEntryGroup(g: SelectionEntryGroup): void {
    this.register(g["@_id"], g);
    this.indexConstraints(g.constraints);
    children<SelectionEntry>(g.selectionEntries, "selectionEntry").forEach((c) =>
      this.indexSelectionEntry(c)
    );
    children<SelectionEntryGroup>(
      g.selectionEntryGroups,
      "selectionEntryGroup"
    ).forEach((nested) => this.indexSelectionEntryGroup(nested));
  }

  private indexConstraints(wrap: unknown): void {
    children<Constraint>(wrap, "constraint").forEach((c) => {
      if (c["@_id"]) this.constraintsById.set(c["@_id"], c);
    });
  }

  private register(id: EntryId, node: LinkableNode): void {
    if (this.entriesById.has(id)) {
      this.diagnostics.push(`Doppelte Entry-Id: ${id}`);
    }
    this.entriesById.set(id, node);
  }

  // --- Nachschlage-API ---

  resolveEntry(targetId: EntryId): LinkableNode | undefined {
    return this.entriesById.get(targetId);
  }

  resolveProfile(id: string): Profile | undefined {
    return this.profilesById.get(id);
  }

  resolveRule(id: string): Rule | undefined {
    return this.rulesById.get(id);
  }

  resolveCategory(id: CategoryId): CategoryEntry | undefined {
    return this.categoryEntriesById.get(id);
  }

  costTypeName(id: CostTypeId): string {
    return this.costTypesById.get(id)?.["@_name"] ?? id;
  }
}
