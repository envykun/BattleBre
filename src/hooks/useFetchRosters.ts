import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useCallback, useEffect, useState } from "react";
import { Roster, type RosterSelection } from "../data/models/roster";
import {
  extractRosterXml,
  parseRosterXml,
} from "../data/parser/warhammer/dataExtractor10e";

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
  addRoster: () => Promise<void>;
  loadRosters: () => Promise<void>;
};

const rosterPoints = (roster: Roster) => {
  const pointsCost = roster.costs.find(
    (cost) => cost.name.trim().toLowerCase() === "pts"
  );
  if (!pointsCost) {
    return 0;
  }
  if (typeof pointsCost.value === "number") {
    return pointsCost.value;
  }
  const parsed = Number(pointsCost.valueText ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const countUnits = (selections: RosterSelection[]): number =>
  selections.reduce((count, selection) => {
    const type = selection.type?.toLowerCase();
    const isUnitLike = type === "unit" || type === "model";
    const isGrouped = selection.from === "group";
    const nextCount = isUnitLike && !isGrouped ? 1 : 0;
    return count + nextCount + countUnits(selection.selections);
  }, 0);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const stripRosterExtension = (value: string) =>
  value.replace(/\.(rosz|ros)$/i, "");

export function useFetchRosters(): UseFetchRostersResult {
  const [rosters, setRosters] = useState<RosterMeta[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRosters();
  }, []);

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

        setRosters(DEFAULT_ROSTERS);

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

      setRosters(payload);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load rosters.";
      setError(message);
      setRosters(null);
    } finally {
      setLoading(false);
    }
  };

  const addRoster = useCallback(async () => {
    try {
      setError(null);
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        type: "*/*",
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const [asset] = result.assets;
      if (!asset?.uri) {
        throw new Error("No roster file selected.");
      }

      const displayName = asset.name ?? "roster";
      const normalizedName = displayName.toLowerCase();
      const isZip = normalizedName.endsWith(".rosz");
      const isRoster = normalizedName.endsWith(".ros");

      if (!isZip && !isRoster) {
        throw new Error("Unsupported roster file. Use .ros or .rosz.");
      }

      const pickedFile = new FileSystem.File(asset.uri);
      const raw = isZip ? await pickedFile.base64() : await pickedFile.text();

      const xml = await extractRosterXml(raw, { isZip });
      const parsed = parseRosterXml(xml);

      if (!parsed?.roster) {
        throw new Error("Invalid roster file.");
      }

      const roster = Roster.fromRaw(parsed.roster);
      const rosterId = `roster-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 6)}`;
      const baseName = slugify(
        stripRosterExtension(roster.name || displayName || "roster")
      );
      const fileName = `${baseName || "roster"}-${rosterId}.ros`;
      const filePath = `rosters/${fileName}`;

      const storedFile = new FileSystem.File(
        FileSystem.Paths.document,
        filePath
      );
      if (!storedFile.exists) {
        storedFile.create({ intermediates: true });
      }
      storedFile.write(xml);

      const faction =
        roster.forces[0]?.catalogueName ?? roster.forces[0]?.name ?? "Unknown";
      const unitCount = countUnits(
        roster.forces.flatMap((force) => force.selections)
      );
      const lastUpdated = new Date().toISOString().slice(0, 10);

      const newRoster: RosterMeta = {
        id: rosterId,
        name: roster.name || displayName,
        fileName,
        filePath,
        faction,
        points: rosterPoints(roster),
        unitCount,
        lastUpdated,
      };

      const nextRosters = [...(rosters ?? []), newRoster];
      const rosterFile = new FileSystem.File(
        FileSystem.Paths.document,
        "rosters.json"
      );
      if (!rosterFile.exists) {
        rosterFile.create({ intermediates: true });
      }
      rosterFile.write(JSON.stringify({ rosters: nextRosters }));

      setRosters(nextRosters);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add roster.";
      setError(message);
    }
  }, [rosters]);

  return { rosters, loading, error, addRoster, loadRosters };
}
