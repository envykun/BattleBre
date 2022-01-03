// import { Create40kRoster } from "./roster40k";
// import { Renderer40k } from "./renderer40k";
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = new JSDOM("").window;
global.document = document;

var $ = require("jquery")(window);

import fs from "fs";
import JSZip from "jszip";
import xml2js from "xml2js";
const DOMParser = require("xmldom").DOMParser;

function parseXML(xmldata: string) {
  let parser = new DOMParser();
  let doc = parser.parseFromString(xmldata, "text/xml");

  // fs.writeFileSync("newFile.xml", xmldata);

  xml2js.parseString(xmldata, (err, result) => {
    if (err) {
      throw err;
    }

    // `result` is a JavaScript object
    // convert it to a JSON string
    const json = JSON.stringify(result, null, 4);

    // log JSON string
    console.log(json);
    fs.writeFileSync("newJson.json", json);
  });

  if (doc) {
    // Determine roster type (game system).
    let info = doc.getElementsByClassName("roster");
    if (info) {
      // const gameType = info.getAttributeNode("gameSystemName")?.nodeValue;
      // if (!gameType) return;

      const rosterTitle = $("#roster-title")[0];
      const rosterList = $("#roster-lists")[0];
      const forceUnits = $("#force-units")[0];

      // if (gameType == "Warhammer 40,000 8th Edition") {
      //   let roster = Create40kRoster(doc);
      //   if (roster) {
      //     if (roster._forces.length > 0) {
      //       const renderer: Renderer40k = new Renderer40k(roster);
      //       renderer.render(rosterTitle, rosterList, forceUnits);
      //     }
      //   }
      // } else if (gameType == "Warhammer 40,000 9th Edition") {
      //   let roster = Create40kRoster(doc);
      //   if (roster) {
      //     if (roster._forces.length > 0) {
      //       const renderer: Renderer40k = new Renderer40k(roster);
      //       renderer.render(rosterTitle, rosterList, forceUnits);
      //     }
      //   }
      // } else {
      //   $("#errorText").html(
      //     "PrettyScribe does not support game type '" + gameType + "'."
      //   );
      //   $("#errorDialog").modal();
      // }
    }
  }
}

const unzip = async (file: string): Promise<string> => {
  if (file.charAt(0) !== "P") {
    return file;
  } else {
    const jszip = new JSZip();
    const zip = await jszip.loadAsync(file);
    return zip.file(/[^/]+\.ros/)[0].async("string"); // Get roster files that are in the root
  }
};

function handleFileSelect() {
  const files = fs.readFileSync("RosterFile.rosz", "binary");
  fs.writeFileSync("BinFile.txt", files);
  unzip(files)
    .then((xml) => parseXML(xml))
    .catch((err) => console.log(err));
}

handleFileSelect();
