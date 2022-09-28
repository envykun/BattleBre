const tintColorLight = "#4A7E94";
const tintColorDark = "#fff";

export function setCodexColor(army: string): void {
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
  default: { primary: "#12517E", secondary: "#CEDCEB" },
  "Aeldari - Craftworlds": { primary: "#12517E", secondary: "#CEDCEB" },
  "Aeldari - Drukhari": { primary: "#0B474A", secondary: "#9FC2C4" },
  "Aeldari - FW Corsairs": { primary: "#12517E", secondary: "#CEDCEB" },
  "Aeldari - Harlequins": { primary: "#12517E", secondary: "#CEDCEB" },
  "Aeldari - Ynnari": { primary: "#12517E", secondary: "#CEDCEB" },
  "Chaos - Chaos Knights": { primary: "#12517E", secondary: "#CEDCEB" },
  "Chaos - Chaos Space Marines": { primary: "#12517E", secondary: "#CEDCEB" },
  "Chaos - Daemons": { primary: "#B5AB92", secondary: "#C6BBAF" },
  "Chaos - Death Guard": { primary: "#8A7B5C", secondary: "#D8CFC7" },
  "Chaos - FW Heretic Astartes": { primary: "#12517E", secondary: "#CEDCEB" },
  "Chaos - FW Renegade and Heretics": { primary: "#12517E", secondary: "#CEDCEB" },
  "Chaos - Gellerpox Infected": { primary: "#12517E", secondary: "#CEDCEB" },
  "Chaos - Servants of the Abyss": { primary: "#12517E", secondary: "#CEDCEB" },
  "Chaos - Thousand Sons": { primary: "#072D52", secondary: "#828D96" },
  "Chaos - Titanicus Traitoris": { primary: "#12517E", secondary: "#CEDCEB" },
  Fallen: { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Adepta Sororitas": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Adeptus Astra Telepathica": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Adeptus Custodes": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Adeptus Mechanicus": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Astra Cartographica": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Astra Militarum - Library": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Astra Militarum": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Black Templars": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Blackstone Fortress": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Blood Angels": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Dark Angels": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Deathwatch": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Elucidian Starstriders": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - FW Adeptus Astartes": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - FW Death Korps of Krieg": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - FW Elysians": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Grey Knights": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Imperial Fists": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Imperial Knights": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Inquisition": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Iron Hands": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Legion of the Damned": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Officio Assassinorum": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Raven Guard": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Salamanders": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Sisters of Silence": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Space Marines": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Space Wolves": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Titan Legions": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - Ultramarines": { primary: "#12517E", secondary: "#CEDCEB" },
  "Imperium - White Scars": { primary: "#12517E", secondary: "#CEDCEB" },
  Necrons: { primary: "#12517E", secondary: "#CEDCEB" },
  Orks: { primary: "#12517E", secondary: "#CEDCEB" },
  "T'au Empire": { primary: "#12517E", secondary: "#CEDCEB" },
  "Tyranids - Genestealer Cults": { primary: "#12517E", secondary: "#CEDCEB" },
  Tyranids: { primary: "#12517E", secondary: "#CEDCEB" },
  "Unaligned - Monsters and Gribblies": { primary: "#12517E", secondary: "#CEDCEB" },
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
  default: {
    error: "#a10000",
    success: "#099609",
  },
};

export default Colors;
