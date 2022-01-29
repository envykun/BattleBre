const fs = require("fs");

let files;

fs.readdir("C:\\Users\\.eNvy\\BattleScribe\\data\\Warhammer 40,000 9th Edition", "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  files = data.map((name) => {
    return name.slice(0, -5);
  });
  console.log(files);
});
