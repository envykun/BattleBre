/**
 * Auflösung roher Einträge/Links zu "effektiven" Knoten.
 *
 * Ein entryLink wird auf sein Ziel aufgelöst; die Overlays des Links
 * (constraints/modifiers/costs/categoryLinks/profiles/infoLinks) werden über die
 * des Ziels gelegt. WICHTIG: Die Identität eines über einen Link erzeugten
 * Knotens ist die LINK-Id, nicht die Ziel-Id (relevant für Conditions/Constraints).
 *
 * Kinder werden NICHT eager expandiert (Kataloge sind rekursiv und riesig) –
 * `childRefs` liefert nur unaufgelöste Referenzen, die bei Bedarf erneut durch
 * `resolveEffective` laufen.
 */
import {
  CategoryLink,
  Constraint,
  Cost,
  EntryLink,
  InfoLink,
  Modifier,
  ModifierGroup,
  Profile,
  SelectionEntry,
  SelectionEntryGroup,
} from "../types/catalogue";
import { attrBool, attrStr, children } from "../data/xml";
import { GameContext, LinkableNode } from "./GameContext";

export type EntryRef =
  | { kind: "entry"; node: SelectionEntry }
  | { kind: "group"; node: SelectionEntryGroup }
  | { kind: "link"; node: EntryLink };

export interface EffectiveEntry {
  /** Identität (Link-Id, falls über Link erzeugt; sonst Entry-Id). */
  id: string;
  /** Ziel-Entry-Id (== id, wenn direkt). */
  targetId: string;
  kind: "entry" | "group";
  name: string;
  type: string; // "unit" | "model" | "upgrade" | "group"
  hidden: boolean;
  collective: boolean;
  defaultSelectionEntryId?: string;

  constraints: Constraint[];
  modifiers: Modifier[];
  modifierGroups: ModifierGroup[];
  costs: Cost[];
  categoryLinks: CategoryLink[];
  profiles: Profile[];
  infoLinks: InfoLink[];

  childRefs: EntryRef[];
}

/** Löst eine Referenz (Entry/Group/Link) zu einem effektiven Knoten auf. */
export function resolveEffective(
  ctx: GameContext,
  ref: EntryRef
): EffectiveEntry | undefined {
  if (ref.kind === "link") {
    const targetId = ref.node["@_targetId"];
    const target = targetId ? ctx.resolveEntry(targetId) : undefined;
    if (!target) {
      ctx.diagnostics.push(
        `entryLink ${ref.node["@_id"]} → unbekanntes Ziel ${ref.node["@_targetId"]}`
      );
      return undefined;
    }
    return buildEffective(ctx, ref.node["@_id"], target, ref.node);
  }
  const node = ref.node;
  return buildEffective(ctx, node["@_id"], node, undefined);
}

function isGroup(node: LinkableNode): node is SelectionEntryGroup {
  return !("@_type" in node);
}

function buildEffective(
  ctx: GameContext,
  identity: string,
  target: LinkableNode,
  link: EntryLink | undefined
): EffectiveEntry {
  const group = isGroup(target);

  const constraints = [
    ...children<Constraint>(target.constraints, "constraint"),
    ...(link ? children<Constraint>(link.constraints, "constraint") : []),
  ];
  const modifiers = [
    ...children<Modifier>(target.modifiers, "modifier"),
    ...(link ? children<Modifier>(link.modifiers, "modifier") : []),
  ];
  const modifierGroups = [
    ...children<ModifierGroup>(target.modifierGroups, "modifierGroup"),
    ...(link ? children<ModifierGroup>(link.modifierGroups, "modifierGroup") : []),
  ];

  // Kosten: Link-Kosten überschreiben Ziel-Kosten desselben typeId.
  const targetCosts = group ? [] : children<Cost>(target.costs, "cost");
  const linkCosts = link ? children<Cost>(link.costs, "cost") : [];
  const costs = mergeCosts(targetCosts, linkCosts);

  const categoryLinks = [
    ...(group ? [] : children<CategoryLink>((target as SelectionEntry).categoryLinks, "categoryLink")),
    ...(link ? children<CategoryLink>(link.categoryLinks, "categoryLink") : []),
  ];
  const profiles = [
    ...(group ? [] : children<Profile>((target as SelectionEntry).profiles, "profile")),
    ...(link ? children<Profile>(link.profiles, "profile") : []),
  ];
  const infoLinks = [
    ...(group ? [] : children<InfoLink>((target as SelectionEntry).infoLinks, "infoLink")),
    ...(link ? children<InfoLink>(link.infoLinks, "infoLink") : []),
  ];

  return {
    id: identity,
    targetId: target["@_id"],
    kind: group ? "group" : "entry",
    name: attrStr(link?.["@_name"]) || attrStr(target["@_name"]),
    type: group ? "group" : attrStr((target as SelectionEntry)["@_type"], "upgrade"),
    hidden: attrBool(link?.["@_hidden"]) || attrBool(target["@_hidden"]),
    collective:
      attrBool(link?.["@_collective"]) || attrBool(target["@_collective"]),
    defaultSelectionEntryId: group
      ? (target as SelectionEntryGroup)["@_defaultSelectionEntryId"]
      : undefined,
    constraints,
    modifiers,
    modifierGroups,
    costs,
    categoryLinks,
    profiles,
    infoLinks,
    childRefs: collectChildRefs(target),
  };
}

function mergeCosts(base: Cost[], overlay: Cost[]): Cost[] {
  if (overlay.length === 0) return base;
  const byType = new Map<string, Cost>();
  for (const c of base) byType.set(c["@_typeId"] ?? "", c);
  for (const c of overlay) byType.set(c["@_typeId"] ?? "", c);
  return Array.from(byType.values());
}

/**
 * Objekte mit den Struktur-Wrappern (LinkableNode oder Katalog-Wurzel).
 * Wrapper als `unknown`, da die BSData-Rohtypen `T | T[]` verwenden – der
 * `children`-Helfer normalisiert beides.
 */
interface HasStructuralChildren {
  selectionEntries?: unknown;
  selectionEntryGroups?: unknown;
  entryLinks?: unknown;
}

/** Sammelt die strukturellen Kinder eines Knotens als (unaufgelöste) Refs. */
export function collectChildRefs(node: HasStructuralChildren): EntryRef[] {
  const refs: EntryRef[] = [];
  children<SelectionEntry>(node.selectionEntries, "selectionEntry").forEach((n) =>
    refs.push({ kind: "entry", node: n })
  );
  children<SelectionEntryGroup>(
    node.selectionEntryGroups,
    "selectionEntryGroup"
  ).forEach((n) => refs.push({ kind: "group", node: n }));
  children<EntryLink>(node.entryLinks, "entryLink").forEach((n) =>
    refs.push({ kind: "link", node: n })
  );
  return refs;
}

/** Wurzel-Refs eines Katalogs/GameSystems. */
export function rootRefsOf(root: HasStructuralChildren): EntryRef[] {
  return collectChildRefs(root);
}

/** Ein hinzufügbarer Eintrag samt (optionaler) besitzender Gruppe. */
export interface AddableItem {
  eff: EffectiveEntry;
  groupId?: string;
}

/**
 * Expandiert Refs zu tatsächlich wählbaren Einträgen. Gruppen sind transparent:
 * es wird in sie hineingestiegen, und die enthaltenen Einträge tragen die
 * (innerste) Gruppen-Id. Nicht-Gruppen-Einträge werden NICHT weiter expandiert.
 */
export function expandAddable(
  ctx: GameContext,
  refs: EntryRef[],
  groupId?: string
): AddableItem[] {
  const out: AddableItem[] = [];
  for (const ref of refs) {
    const eff = resolveEffective(ctx, ref);
    if (!eff) continue;
    if (eff.kind === "group") {
      out.push(...expandAddable(ctx, eff.childRefs, eff.id));
    } else {
      out.push({ eff, groupId });
    }
  }
  return out;
}

/** Sammelt alle (auch verschachtelten) Gruppen unter den gegebenen Refs. */
export function collectGroups(ctx: GameContext, refs: EntryRef[]): EffectiveEntry[] {
  const out: EffectiveEntry[] = [];
  for (const ref of refs) {
    const eff = resolveEffective(ctx, ref);
    if (!eff || eff.kind !== "group") continue;
    out.push(eff);
    out.push(...collectGroups(ctx, eff.childRefs));
  }
  return out;
}
