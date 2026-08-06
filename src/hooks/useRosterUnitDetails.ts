import type {
  BattleBreRosterEngine,
  UnitAbility,
  UnitCharacteristics,
  UnitDetails,
  UnitModel,
  UnitProfileSection,
  UnitWeapon,
} from "@/src/data/battlebre-engine/roster-engine";
import { useMemo } from "react";

export type {
  UnitAbility,
  UnitCharacteristics,
  UnitDetails,
  UnitModel,
  UnitProfileSection,
  UnitWeapon,
} from "@/src/data/battlebre-engine/roster-engine";

export function useRosterUnitDetails(
  engine: BattleBreRosterEngine | null,
  unitId: string | null,
): UnitDetails | null {
  return useMemo(() => {
    if (!engine || !unitId) {
      return null;
    }
    return engine.getUnitDetails(unitId);
  }, [engine, unitId]);
}
