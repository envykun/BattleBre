import JSZip from "jszip";
const DOMParser = require("xmldom").DOMParser;

function getForce(data: string): any {
  unzip(data)
    .then((xml) => parseXML(xml))
    .catch((err) => console.log(err));

  //   return forceArray;
}

function parseXML(xmldata: string) {
  let parser = new DOMParser();
  let doc = parser.parseFromString(xmldata, "text/xml");

  if (doc) {
    let info = doc.getElementsByClassName("roster");
    if (info) {
      console.log(info);
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

export { getForce };
