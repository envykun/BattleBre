import { Roster } from "./models/common";
import {
  DefaultPlugin,
  GameSystemPlugin,
  RosterIndex,
} from "./plugins/gamesystem.plugin";

export class BattleBreEngine {
  private roster: Roster | null = null;
  private index: RosterIndex | null = null;
  private plugin: GameSystemPlugin = DefaultPlugin;
  private plugins: GameSystemPlugin[];

  constructor(opts?: { plugins?: GameSystemPlugin[] }) {
    this.plugins = opts?.plugins ?? [];
  }
}
