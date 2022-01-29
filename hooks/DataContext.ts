import React from "react";
import { RosterCosts, Rule, Unit } from "../utils/DataTypes";

export const DataContext = React.createContext<DataContextType>({
  context: { fileName: "", rosterCost: { points: "0", cp: "0", faction: "" }, unitData: [], forceRules: [] },
  setContext: (context) => console.info("no data yet"),
});

export type DataContextType = {
  context: DataContextValueType;
  setContext: (context: any) => void;
};

export type DataContextValueType = {
  fileName: string;
  rosterCost: RosterCosts;
  unitData: Array<Unit> | [];
  forceRules: Array<Rule> | [];
};
