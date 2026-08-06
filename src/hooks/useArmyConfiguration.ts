import type {
  ArmyConfiguration,
  BattleBreRosterEngine,
} from "@/src/data/battlebre-engine/roster-engine";
import { useMemo } from "react";

export type { ArmyConfiguration } from "@/src/data/battlebre-engine/roster-engine";

export function useArmyConfiguration(
  engine: BattleBreRosterEngine | null,
): ArmyConfiguration {
  return useMemo(
    () => (engine ? engine.getArmyConfiguration() : { globalRules: [], configurations: [] }),
    [engine],
  );
}
