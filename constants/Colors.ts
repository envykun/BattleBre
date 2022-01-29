const tintColorLight = "#4A7E94";
const tintColorDark = "#fff";

export function setCodexColor(army: string): void {
  console.log("ARMY", army);
  if (army === undefined || !(army in codexColors)) return;

  Colors.light.primary = codexColors[army].primary;
  Colors.light.secondary = codexColors[army].secondary;
  Colors.light.tint = codexColors[army].primary;
  Colors.light.tabIconSelected = codexColors[army].primary;
  Colors.dark.primary = codexColors[army].primary;
  Colors.dark.secondary = codexColors[army].secondary;
  Colors.dark.tint = codexColors[army].primary;
  Colors.dark.tabIconSelected = codexColors[army].primary;
}

const codexColors: any = {
  "Aeldari - Craftworlds": { primary: "blue", secondary: "green" },
  "Aeldari - Drukhari": { primary: "#0B474A", secondary: "#9FC2C4" },
  "Aeldari - FW Corsairs": { primary: "blue", secondary: "green" },
  "Aeldari - Harlequins": { primary: "blue", secondary: "green" },
  "Aeldari - Ynnari": { primary: "blue", secondary: "green" },
  "Chaos - Chaos Knights": { primary: "blue", secondary: "green" },
  "Chaos - Chaos Space Marines": { primary: "blue", secondary: "green" },
  "Chaos - Daemons": { primary: "#B5AB92", secondary: "#C6BBAF" },
  "Chaos - Death Guard": { primary: "#8A7B5C", secondary: "#D8CFC7" },
  "Chaos - FW Heretic Astartes": { primary: "blue", secondary: "green" },
  "Chaos - FW Renegade and Heretics": { primary: "blue", secondary: "green" },
  "Chaos - Gellerpox Infected": { primary: "blue", secondary: "green" },
  "Chaos - Servants of the Abyss": { primary: "blue", secondary: "green" },
  "Chaos - Thousand Sons": { primary: "#072D52", secondary: "#828D96" },
  "Chaos - Titanicus Traitoris": { primary: "blue", secondary: "green" },
  Fallen: { primary: "blue", secondary: "green" },
  "Imperium - Adepta Sororitas": { primary: "blue", secondary: "green" },
  "Imperium - Adeptus Astra Telepathica": { primary: "blue", secondary: "green" },
  "Imperium - Adeptus Custodes": { primary: "blue", secondary: "green" },
  "Imperium - Adeptus Mechanicus": { primary: "blue", secondary: "green" },
  "Imperium - Astra Cartographica": { primary: "blue", secondary: "green" },
  "Imperium - Astra Militarum - Library": { primary: "blue", secondary: "green" },
  "Imperium - Astra Militarum": { primary: "blue", secondary: "green" },
  "Imperium - Black Templars": { primary: "blue", secondary: "green" },
  "Imperium - Blackstone Fortress": { primary: "blue", secondary: "green" },
  "Imperium - Blood Angels": { primary: "blue", secondary: "green" },
  "Imperium - Dark Angels": { primary: "blue", secondary: "green" },
  "Imperium - Deathwatch": { primary: "blue", secondary: "green" },
  "Imperium - Elucidian Starstriders": { primary: "blue", secondary: "green" },
  "Imperium - FW Adeptus Astartes": { primary: "blue", secondary: "green" },
  "Imperium - FW Death Korps of Krieg": { primary: "blue", secondary: "green" },
  "Imperium - FW Elysians": { primary: "blue", secondary: "green" },
  "Imperium - Grey Knights": { primary: "blue", secondary: "green" },
  "Imperium - Imperial Fists": { primary: "blue", secondary: "green" },
  "Imperium - Imperial Knights": { primary: "blue", secondary: "green" },
  "Imperium - Inquisition": { primary: "blue", secondary: "green" },
  "Imperium - Iron Hands": { primary: "blue", secondary: "green" },
  "Imperium - Legion of the Damned": { primary: "blue", secondary: "green" },
  "Imperium - Officio Assassinorum": { primary: "blue", secondary: "green" },
  "Imperium - Raven Guard": { primary: "blue", secondary: "green" },
  "Imperium - Salamanders": { primary: "blue", secondary: "green" },
  "Imperium - Sisters of Silence": { primary: "blue", secondary: "green" },
  "Imperium - Space Marines": { primary: "blue", secondary: "green" },
  "Imperium - Space Wolves": { primary: "blue", secondary: "green" },
  "Imperium - Titan Legions": { primary: "blue", secondary: "green" },
  "Imperium - Ultramarines": { primary: "blue", secondary: "green" },
  "Imperium - White Scars": { primary: "blue", secondary: "green" },
  Necrons: { primary: "blue", secondary: "green" },
  Orks: { primary: "blue", secondary: "green" },
  "T'au Empire": { primary: "blue", secondary: "green" },
  "Tyranids - Genestealer Cults": { primary: "blue", secondary: "green" },
  Tyranids: { primary: "blue", secondary: "green" },
  "Unaligned - Monsters and Gribblies": { primary: "blue", secondary: "green" },
};

const Colors = {
  light: {
    text: "#000",
    background: "#fff",
    tint: tintColorLight,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorLight,
    primary: tintColorLight,
    secondary: "#D1E9F5",
  },
  dark: {
    text: "#fff",
    background: "#000",
    tint: tintColorDark,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorDark,
    primary: tintColorLight,
    secondary: "#D1E9F5",
  },
};

export default Colors;
