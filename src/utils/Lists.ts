import FS from "node:fs";

const lists: {
  pastas: string[];
  jokes: string[];
  embarrassingThings: string[];
  mio: string[];
  kumiko: string[];
  dadsDabbing: string[];
  advice: string[];
  felix: string[];
  goodbye: string[];
  thanks: string[];
} = JSON.parse(FS.readFileSync("./data/lists.json", "utf-8"));

export default lists;
