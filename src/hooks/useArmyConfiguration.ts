import type { Roster } from "@/src/data/models/roster";
import { useMemo } from "react";

export type ArmyConfiguration = {
  detachment?: any;
};

export function useArmyConfiguration(roster: Roster | null): ArmyConfiguration {
  return useMemo(() => {
    if (!roster) {
      return {};
    }

    const configuration: ArmyConfiguration = {};

    return configuration;
  }, [roster]);
}
