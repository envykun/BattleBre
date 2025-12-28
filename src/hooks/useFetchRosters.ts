import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";

export type RosterMeta = {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  faction: string;
  points: number;
  unitCount: number;
  lastUpdated: string;
  tags?: string[];
};

const DEFAULT_ROSTERS: RosterMeta[] = [
  {
    id: "roster-001",
    name: "Iron Legion Strike",
    fileName: "iron-legion-strike.roster.json",
    filePath: "rosters/iron-legion-strike.rosz",
    faction: "Iron Legion",
    points: 1995,
    unitCount: 12,
    lastUpdated: "2025-02-18",
    tags: ["tournament", "balanced"],
  },
  {
    id: "roster-002",
    name: "Verdant Host",
    fileName: "verdant-host.roster.json",
    filePath: "rosters/verdant-host.ros",
    faction: "Sylvan Alliance",
    points: 1500,
    unitCount: 9,
    lastUpdated: "2025-01-07",
    tags: ["campaign"],
  },
  {
    id: "roster-003",
    name: "Obsidian Raiders",
    fileName: "obsidian-raiders.roster.json",
    filePath: "rosters/obsidian-raiders.rosz",
    faction: "Obsidian Guild",
    points: 1000,
    unitCount: 6,
    lastUpdated: "2024-12-10",
    tags: ["skirmish"],
  },
];

type UseFetchRostersResult = {
  rosters: RosterMeta[] | null;
  loading: boolean;
  error: string | null;
};

export function useFetchRosters(): UseFetchRostersResult {
  const [rosters, setRosters] = useState<RosterMeta[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRosters = async () => {
      try {
        setLoading(true);
        setError(null);

        const rosterFile = new FileSystem.File(
          FileSystem.Paths.document,
          "rosters.json"
        );
        // rosterFile.delete(); // test-only: remove local file to re-seed

        if (!rosterFile.exists) {
          const emptyPayload = { rosters: DEFAULT_ROSTERS };
          rosterFile.create({ intermediates: true });
          rosterFile.write(JSON.stringify(emptyPayload));

          if (isMounted) {
            setRosters(DEFAULT_ROSTERS);
          }

          return;
        }

        const fileContent = await rosterFile.text();
        const json = JSON.parse(fileContent) as {
          rosters?: RosterMeta[];
        };
        const payload = Array.isArray(json?.rosters) ? json.rosters : json;

        if (!Array.isArray(payload)) {
          throw new Error("Invalid roster metadata format.");
        }

        if (isMounted) {
          setRosters(payload);
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "Failed to load rosters.";
          setError(message);
          setRosters(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRosters();

    return () => {
      isMounted = false;
    };
  }, []);

  return { rosters, loading, error };
}
