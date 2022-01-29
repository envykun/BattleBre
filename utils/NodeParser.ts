// import { Create40kRoster } from "./roster40k";
// import { Renderer40k } from "./renderer40k";
import { validationOptions, X2jOptions, XMLParser } from "fast-xml-parser";
const fs = require("fs");
const JSZip = require("jszip");
// const xml2js = require("xml2js");
// const DOMParser1 = require("xmldom").DOMParser;

const options: Partial<X2jOptions> = {
  attributeNamePrefix: "@_",
  ignoreAttributes: false,
};

function parseXML(xmldata: string) {
  let parser = new XMLParser(options);
  let doc = parser.parse(xmldata);

  const json = JSON.stringify(doc);

  console.log(json);

  fs.writeFileSync("newJson.json", json);

  // let parser = new DOMParser1();
  // let doc = parser.parseFromString(xmldata, "text/xml");

  // fs.writeFileSync("newFile.xml", xmldata);

  // xml2js.parseString(xmldata, (err: any, result: any) => {
  //   if (err) {
  //     throw err;
  //   }

  //   // `result` is a JavaScript object
  //   // convert it to a JSON string
  //   const json = JSON.stringify(result, null, 4);

  //   // log JSON string
  //   console.log(json);
  //   fs.writeFileSync("newJson.json", json);
  // });
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
