/**
 * Öffentliche Typen der Builder-API.
 */
import { Severity } from "../types/enums";
import {
  CatalogueId,
  CostTypeId,
  ForceEntryId,
  ForceId,
  InstanceId,
} from "../types/ids";

export interface ValidationMessage {
  severity: Severity;
  /** Betroffene Selection-Instanz (falls zutreffend) – für UI-Highlighting. */
  instanceId?: InstanceId;
  forceId?: ForceId;
  constraintId?: string;
  message: string;
  scope: string;
}

export interface ValidationReport {
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
}

export interface AddableForce {
  forceEntryId: ForceEntryId;
  name: string;
  catalogueId: CatalogueId;
  catalogueName: string;
}

export interface AddableEntry {
  /** Effektive Id (Entry- oder Link-Id) zum Hinzufügen. */
  id: string;
  name: string;
  type: string; // "unit" | "model" | "upgrade" | "group"
  isGroup: boolean;
  hidden: boolean;
  /** Standard-Kosten je costType (für Menü-Anzeige). */
  costs: { typeId: CostTypeId; name: string; value: number }[];
}

// --- Read-Model für die UI ---------------------------------------------------

export interface RosterView {
  id: string;
  name: string;
  gameSystemName: string;
  costTotals: { typeId: CostTypeId; name: string; value: number; limit?: number }[];
  forces: ForceView[];
}

export interface ForceView {
  id: ForceId;
  name: string;
  catalogueName: string;
  selections: SelectionView[];
}

export interface SelectionView {
  instanceId: InstanceId;
  name: string;
  type: string;
  number: number;
  categories: string[];
  costs: { typeId: CostTypeId; name: string; value: number }[];
  children: SelectionView[];
}

export interface AddResult {
  instanceId: InstanceId;
  report: ValidationReport;
}
