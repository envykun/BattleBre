import type {
  BattleBreRosterEngine,
  UnitItem,
  UnitSection,
} from "@/src/data/battlebre-engine/roster-engine";
import { useMemo } from "react";

export type { UnitItem, UnitSection } from "@/src/data/battlebre-engine/roster-engine";

export function useRosterUnits(engine: BattleBreRosterEngine | null): UnitSection[] {
  return useMemo(() => (engine ? engine.getUnitSections() : []), [engine]);
}
