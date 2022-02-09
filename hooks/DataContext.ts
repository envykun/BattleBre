import React from "react";
import { RosterCosts, Rule, StratagemData, Unit } from "../utils/DataTypes";
import { FactionStratagems } from "./useFetchStratagemData";

export const DataContext = React.createContext<DataContextType>({
  context: {
    fileName: "",
    stratagems: { data: [], phases: "", version: "" },
    rosterCost: { points: "0", cp: "0", faction: "" },
    unitData: [],
    forceRules: [],
  },
  setContext: (context) => console.info("no data yet"),
});

export type DataContextType = {
  context: DataContextValueType;
  setContext: (context: any) => void;
};

export interface DataContextValueType extends DataExtractorType {
  fileName: string;
  stratagems: FactionStratagems | undefined;
}

export type DataExtractorType = {
  rosterCost: RosterCosts;
  unitData: Array<Unit> | [];
  forceRules: Array<Rule> | [];
};
