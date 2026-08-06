import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";
import { BattleBreRosterEngine } from "../data/battlebre-engine/roster-engine";
import { toEngineRoster } from "../data/battlebre-engine/adapters/legacy-roster";
import { DefaultPlugin } from "../data/battlebre-engine/plugins/gamesystem.plugin";
import type { Roster } from "../data/battlebre-engine/models/common";
import { parseRoster } from "../data/parser/warhammer/dataExtractor10e";
import { RosterMeta } from "./useFetchRosters";

export type RosterFileData = {
  meta: RosterMeta;
  raw: string;
  isZip: boolean;
  roster: Roster;
  engine: BattleBreRosterEngine;
};

type UseRosterFileResult = {
  data: RosterFileData | null;
  loading: boolean;
  error: string | null;
};

export function useRosterFile(
  selectedRosterMeta: RosterMeta | null,
): UseRosterFileResult {
  const [data, setData] = useState<RosterFileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRosterData = async () => {
      if (!selectedRosterMeta) {
        setData(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const rosterFile = new FileSystem.File(
          FileSystem.Paths.document,
          selectedRosterMeta.filePath,
        );

        if (!rosterFile.exists) {
          throw new Error("Roster file not found.");
        }

        const isZip = selectedRosterMeta.filePath.endsWith(".rosz");
        const raw = isZip ? await rosterFile.base64() : await rosterFile.text();
        const legacyRoster = await parseRoster(raw, { isZip });
        const roster = toEngineRoster(legacyRoster);
        const engine = new BattleBreRosterEngine(roster, {
          pluginId:
            selectedRosterMeta.pluginId ??
            selectedRosterMeta.gameSystemId ??
            roster.gameSystemId ??
            DefaultPlugin.id,
        });

        if (isMounted) {
          setData({ meta: selectedRosterMeta, raw, isZip, roster, engine });
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "Failed to load roster file.";
          setError(message);
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRosterData();

    return () => {
      isMounted = false;
    };
  }, [selectedRosterMeta]);

  return { data, loading, error };
}
