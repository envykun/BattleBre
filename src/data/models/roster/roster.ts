import type { RawRoster, RosterInit } from "./types";
import { toArray } from "./utils";
import { Cost, CostLimit } from "./costs";
import { Force } from "./entries";

export class Roster {
  id: string;
  name: string;
  battleScribeVersion?: string;
  generatedBy?: string;
  gameSystemId?: string;
  gameSystemName?: string;
  gameSystemRevision?: string;
  xmlns?: string;
  costs: Cost[];
  costLimits: CostLimit[];
  forces: Force[];

  constructor(init: RosterInit) {
    this.id = init.id;
    this.name = init.name;
    this.battleScribeVersion = init.battleScribeVersion;
    this.generatedBy = init.generatedBy;
    this.gameSystemId = init.gameSystemId;
    this.gameSystemName = init.gameSystemName;
    this.gameSystemRevision = init.gameSystemRevision;
    this.xmlns = init.xmlns;
    this.costs = init.costs ?? [];
    this.costLimits = init.costLimits ?? [];
    this.forces = init.forces ?? [];
  }

  static fromRaw(raw: RawRoster): Roster {
    return new Roster({
      id: raw["@_id"],
      name: raw["@_name"],
      battleScribeVersion: raw["@_battleScribeVersion"],
      generatedBy: raw["@_generatedBy"],
      gameSystemId: raw["@_gameSystemId"],
      gameSystemName: raw["@_gameSystemName"],
      gameSystemRevision: raw["@_gameSystemRevision"],
      xmlns: raw["@_xmlns"],
      costs: toArray(raw.costs?.cost).map((entry) => Cost.fromRaw(entry)),
      costLimits: toArray(raw.costLimits?.costLimit).map((entry) =>
        CostLimit.fromRaw(entry),
      ),
      forces: toArray(raw.forces?.force).map((entry) => Force.fromRaw(entry)),
    });
  }
}
