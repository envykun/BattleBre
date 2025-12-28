import * as FileSystem from 'expo-file-system';
import { FactionMapping } from '../constants/FactionMapping';
import { StratagemData } from '../utils/DataTypes';

const sheetId = '1mO0JGcqwER43QMBod15XDOr2Q9-Y5NF1-7T5RTWVSLA';
// const api = "https://v1.nocodeapi.com/envy_kun/google_sheets/BAYvezLEKcgYChVf?tabId=";
const apiKey = 'AIzaSyBihbeMy2CPOq9xwuAAgSFvq0FhQgauOHc';

export async function useFetchStratagemData(bsFaction: string) {
  const faction = FactionMapping[bsFaction];
  const fullDataApi = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchGet?ranges=${faction}!A1:A2&ranges=${faction}!B:J&ranges=${faction}!L:AG&key=${apiKey}`;
  const versionApi = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${faction}!A1:A2?key=${apiKey}`;

  const documentDir = FileSystem.Paths.document;
  const factionFile = new FileSystem.File(documentDir, `${faction}.json`);
  const hasFile = factionFile.exists;

  if (false) {
    documentDir.list().forEach((entry) => entry.delete());
    return;
  }

  if (!hasFile) {
    try {
      const response = await fetch(fullDataApi);
      const json = await response.json();

      const versionData = json.valueRanges[0].values;
      const stratagemData = json.valueRanges[1].values;
      const phasesData = json.valueRanges[2].values;

      const version = versionData
        .slice(1)
        .map((row: Array<string>) => syncIterators(versionData[0], row))[0];
      const newJSON = stratagemData
        .slice(1)
        .map((row: Array<string>) => syncIterators(stratagemData[0], row));
      const newPhases = phasesToObject(phasesData[0], phasesData.slice(1));

      const fileContent: FactionStratagems = {
        version: version.version,
        data: newJSON,
        phases: newPhases,
      };
      if (!factionFile.exists) {
        factionFile.create({ intermediates: true });
      }
      factionFile.write(JSON.stringify(fileContent));

      return fileContent;
    } catch (e) {
      console.log('ERROR:', e);
    }
  }

  const fileContent = await factionFile.text();
  const fileContentJSON: FactionStratagems = JSON.parse(fileContent);
  const version: string = fileContentJSON.version;

  try {
    const versionResponse = await fetch(versionApi);
    const versionJSON = await versionResponse.json();

    const versionData = versionJSON.values;
    const checkedVersion = versionData
      .slice(1)
      .map((row: Array<string>) => syncIterators(versionData[0], row))[0];

    if (version === checkedVersion.version) {
      return fileContentJSON;
    }

    const response = await fetch(fullDataApi);
    const json = await response.json();

    const stratagemData = json.valueRanges[1].values;
    const phasesData = json.valueRanges[2].values;

    const newJSON = stratagemData
      .slice(1)
      .map((row: Array<string>) => syncIterators(stratagemData[0], row));
    const newPhases = phasesToObject(phasesData[0], phasesData.slice(1));
    console.log(newPhases);

    const newFileContent: FactionStratagems = {
      version: checkedVersion.version,
      data: newJSON,
      phases: newPhases,
    };
    if (!factionFile.exists) {
      factionFile.create({ intermediates: true });
    }
    factionFile.write(JSON.stringify(newFileContent));

    return newFileContent;
  } catch (e) {
    console.log('ERROR:', e);
  }
}

function syncIterators(keyArray: Array<string>, valueArray: Array<string>) {
  let newObj: any = {};
  keyArray.forEach((keyItem, idx) =>
    keyItem === 'list'
      ? valueArray[idx] && (newObj[keyItem] = valueArray[idx].split(' || '))
      : (newObj[keyItem] = valueArray[idx]),
  );

  return newObj;
}

function phasesToObject(keyArray: Array<string>, valueArray: Array<string>) {
  let newObj: any = {};
  keyArray.forEach((keyItem, idx) => (newObj[keyItem] = valueArray.map((row: string) => row[idx])));
  return newObj;
}

export interface FactionStratagems {
  version: string;
  data: Array<StratagemData>;
  phases: any;
}
